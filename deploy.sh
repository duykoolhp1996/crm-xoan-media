#!/bin/bash
set -e
cd /home/minh/crm-xoan-media
npm run build
sudo cp -r dist/* /var/www/crm-xoan-media/
sudo chown -R www-data:www-data /var/www/crm-xoan-media
sudo chmod -R 755 /var/www/crm-xoan-media
echo '✅ CRM Xoăn Media đã được cập nhật thành công tại http://192.168.2.47'
