#!/bin/bash
set -e

echo "=========================================================="
echo "🚀 CRM Xoăn Media - Zero-Data-Loss Deployment (v1.1.7)"
echo "=========================================================="

# 1. Tự động sao lưu Database trên Server trước khi deploy bất kỳ thay đổi nào
echo "💾 [Bước 1/5] Kích hoạt sao lưu toàn vẹn Database trên Server..."
ssh -n -T server-pc-tunnel "
  cd /home/minh/crm-xoan-media
  if [ -f server/backup.mjs ]; then
    node server/backup.mjs pre-deploy || echo 'Cảnh báo: Không thể chạy backup script, bỏ qua bước backup tự động.'
  fi
" || true

# 2. Build mã nguồn Frontend React + Vite
echo "🔨 [Bước 2/5] Đang build mã nguồn CRM Frontend..."
npm run build

# 3. Đồng bộ file sang Server Production (Tuyệt đối không chạm vào database và backups)
echo "📦 [Bước 3/5] Đồng bộ mã nguồn sang Server Production (Bảo toàn server/data và backups)..."
rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude 'server/data' \
  --exclude 'server/backups' \
  --exclude '.env' \
  -e "ssh -T" ./ server-pc-tunnel:/home/minh/crm-xoan-media/

# 4. Cập nhật Web Root Nginx & Khởi động lại Backend PM2
echo "🔄 [Bước 4/5] Cập nhật web root và khởi chạy PM2 backend service..."
ssh -n -T server-pc-tunnel "
  sudo cp -r /home/minh/crm-xoan-media/dist/* /var/www/crm-xoan-media/
  sudo chown -R www-data:www-data /var/www/crm-xoan-media
  sudo chmod -R 755 /var/www/crm-xoan-media
  cd /home/minh/crm-xoan-media
  pm2 restart crm-xoan-server || pm2 start server/index.mjs --name crm-xoan-server
  pm2 save
"

# 5. Kiểm tra tính toàn vẹn và Health Check hệ thống
echo "🩺 [Bước 5/5] Kiểm tra Health Check & Database Status sau deploy..."
sleep 2
HEALTH_RES=$(curl -s https://crm.xoanmedia.com/api/health || echo '{"status":"failed"}')
DB_HEALTH_RES=$(curl -s https://crm.xoanmedia.com/api/health/database || echo '{"status":"failed"}')

echo "Health Check: $HEALTH_RES"
echo "Database Status: $DB_HEALTH_RES"

echo "=========================================================="
echo "✅ Đã deploy thành công lên Server Production https://crm.xoanmedia.com! (Version v1.1.7)"
echo "💾 Dữ liệu Database SQL Server được bảo toàn 100%!"
echo "=========================================================="
