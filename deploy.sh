#!/bin/bash
set -e

echo "🚀 Đang build mã nguồn CRM Xoăn Media..."
npm run build

echo "📦 Đang đồng bộ file sang Server Production qua Cloudflare Tunnel..."
rsync -avz --delete --exclude 'node_modules' --exclude '.git' --exclude 'server/data' --exclude 'server/backups' -e "ssh -T" ./ server-pc-tunnel:/home/minh/crm-xoan-media/

echo "🔄 Cập nhật web root và khởi chạy PM2 backend service trên server..."
ssh -n -T server-pc-tunnel "
sudo cp -r /home/minh/crm-xoan-media/dist/* /var/www/crm-xoan-media/
sudo chown -R www-data:www-data /var/www/crm-xoan-media
sudo chmod -R 755 /var/www/crm-xoan-media
cd /home/minh/crm-xoan-media
pm2 restart crm-xoan-server || pm2 start server/index.mjs --name crm-xoan-server
pm2 save
"

echo "✅ Đã deploy thành công lên Server Production https://crm.xoanmedia.com! (Version v1.1.1)"
