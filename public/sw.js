// Service Worker - CRM Xoăn Media v1.3.2
// Hỗ trợ Web Push & In-app System Notifications trên iOS, Android & Desktop

const CACHE_NAME = 'xoan-crm-sw-v1.3.2';

self.addEventListener('install', (event) => {
  // Kích hoạt ngay service worker mới không chờ đợi
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Lắng nghe sự kiện Push từ Server
self.addEventListener('push', (event) => {
  let data = {
    title: 'CRM Xoăn Media',
    body: 'Bạn có thông báo mới từ hệ thống CRM!',
    icon: './favicon.png',
    badge: './favicon.png',
    tag: 'xoan-crm-push',
    url: '/'
  };

  try {
    if (event.data) {
      const parsed = event.data.json();
      data = { ...data, ...parsed };
    }
  } catch {
    if (event.data) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || './favicon.png',
    badge: data.badge || './favicon.png',
    vibrate: [200, 100, 200],
    tag: data.tag || 'xoan-crm-notif',
    renotify: true,
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Xử lý khi người dùng nhấn vào thông báo
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
