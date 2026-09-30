import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'vn.xoanmedia.crm',
  appName: 'CRM Xoăn Media',
  webDir: 'dist',
  server: {
    // Ưu tiên chạy URL trực tuyến để tự động cập nhật tính năng mới mà không cần cài lại app
    url: 'https://duykoolhp1996.github.io/crm-xoan-media/',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0C0E12',
      showSpinner: true,
      spinnerColor: '#B8F23D'
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0C0E12'
    }
  }
};

export default config;
