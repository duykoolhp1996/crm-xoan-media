import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'vn.xoanmedia.crm',
  appName: 'CRM Xoăn Media',
  webDir: 'dist',
  server: {
    // Tự động nạp trực tiếp CRM Production mới nhất, không cần cài lại app khi có tính năng mới
    url: 'https://crm.xoanmedia.com',
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
