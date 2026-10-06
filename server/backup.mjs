import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { db, DB_PATH } from './db.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Thư mục lưu trữ backup database
const DB_BACKUP_DIR = process.env.DB_BACKUP_DIR || path.resolve(__dirname, 'backups', 'db');

if (!fs.existsSync(DB_BACKUP_DIR)) {
  fs.mkdirSync(DB_BACKUP_DIR, { recursive: true });
}

const MAX_BACKUP_FILES = 30;

/**
 * Tạo một bản sao lưu toàn vẹn (Full Atomic Backup) của SQLite Database
 * Sử dụng cơ chế VACUUM INTO chuẩn của SQLite giúp không khóa đọc/ghi
 */
export const createDatabaseBackup = async (label = 'manual') => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `crm_backup_${timestamp}_${label}.db`;
    const targetPath = path.join(DB_BACKUP_DIR, filename);

    // Dùng VACUUM INTO để SQLite tạo bản sao lưu snapshot đồng nhất 100%
    db.exec(`VACUUM INTO '${targetPath.replace(/'/g, "''")}'`);

    const stats = fs.statSync(targetPath);
    console.log(`[Backup] ✅ Đã tạo bản sao lưu DB thành công: ${filename} (${(stats.size / 1024).toFixed(1)} KB)`);

    // Dọn dẹp các bản backup cũ hơn retention policy
    cleanOldBackups();

    return {
      success: true,
      filename,
      filePath: targetPath,
      sizeBytes: stats.size,
      timestamp
    };
  } catch (err) {
    console.error('[Backup] ❌ Lỗi tạo bản sao lưu database:', err.message);
    return {
      success: false,
      error: err.message
    };
  }
};

/**
 * Xóa các bản sao lưu cũ, chỉ giữ lại số lượng quy định (30 bản)
 */
const cleanOldBackups = () => {
  try {
    const files = fs.readdirSync(DB_BACKUP_DIR)
      .filter(f => f.startsWith('crm_backup_') && f.endsWith('.db'))
      .map(f => {
        const full = path.join(DB_BACKUP_DIR, f);
        return { name: f, path: full, mtime: fs.statSync(full).mtime.getTime() };
      })
      .sort((a, b) => b.mtime - a.mtime);

    if (files.length > MAX_BACKUP_FILES) {
      const toDelete = files.slice(MAX_BACKUP_FILES);
      for (const item of toDelete) {
        fs.unlinkSync(item.path);
        console.log(`[Backup] 🗑️ Đã dọn dẹp bản backup cũ: ${item.name}`);
      }
    }
  } catch (err) {
    console.warn('[Backup] Cảnh báo dọn dẹp backup:', err.message);
  }
};

/**
 * Lấy danh sách lịch sử các bản backup DB hiện có
 */
export const listDatabaseBackups = () => {
  try {
    if (!fs.existsSync(DB_BACKUP_DIR)) return [];
    return fs.readdirSync(DB_BACKUP_DIR)
      .filter(f => f.startsWith('crm_backup_') && f.endsWith('.db'))
      .map(f => {
        const full = path.join(DB_BACKUP_DIR, f);
        const stats = fs.statSync(full);
        return {
          filename: f,
          sizeBytes: stats.size,
          createdAt: stats.mtime.toISOString()
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch {
    return [];
  }
};

// Chạy trực tiếp từ dòng lệnh: node server/backup.mjs [label]
if (process.argv[1] && process.argv[1].endsWith('backup.mjs')) {
  const label = process.argv[2] || 'cli';
  createDatabaseBackup(label).then(res => {
    if (!res.success) process.exit(1);
  });
}
