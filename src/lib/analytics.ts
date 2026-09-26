/**
 * Google Analytics 4 (GA4) Tracker Module for Xoăn Media CRM
 * Hỗ trợ tự động tải gtag.js, theo dõi PageView và Custom Events
 */

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

let isInitialized = false;

export const getGA4Id = (): string => {
  return (
    localStorage.getItem('xoan_ga4_measurement_id') ||
    (import.meta as any).env?.VITE_GA4_MEASUREMENT_ID ||
    ''
  );
};

export const setGA4Id = (id: string): void => {
  const trimmed = id.trim();
  if (trimmed) {
    localStorage.setItem('xoan_ga4_measurement_id', trimmed);
    initGA4(trimmed);
  } else {
    localStorage.removeItem('xoan_ga4_measurement_id');
  }
};

export const initGA4 = (customId?: string): void => {
  const measurementId = customId || getGA4Id();

  if (!measurementId || typeof window === 'undefined') {
    return;
  }

  // Nếu script gtag chưa được chèn vào <head>, chèn ngay
  const existingScript = document.getElementById('ga4-gtag-script');
  if (!existingScript) {
    const script = document.createElement('script');
    script.id = 'ga4-gtag-script';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };

    window.gtag('js', new Date());
    window.gtag('config', measurementId, {
      send_page_view: false // Tự điều khiển pageview theo Navigation tab của SPA
    });

    isInitialized = true;
    console.log(`[GA4] Google Analytics 4 đã kích hoạt với mã: ${measurementId}`);
  } else {
    // Nếu đã có script, cấu hình lại ID mới
    if (window.gtag) {
      window.gtag('config', measurementId, {
        send_page_view: false
      });
    }
  }
};

/**
 * Theo dõi chuyển trang / Tab trong CRM
 */
export const trackPageView = (pagePath: string, pageTitle?: string): void => {
  const measurementId = getGA4Id();
  if (!measurementId || typeof window === 'undefined' || !window.gtag) {
    return;
  }

  window.gtag('event', 'page_view', {
    page_title: pageTitle || document.title,
    page_location: window.location.href,
    page_path: pagePath,
    send_to: measurementId
  });
};

/**
 * Theo dõi sự kiện tùy chỉnh (Lead mới, Chuyển Pipeline, Booking, Đăng nhập...)
 */
export const trackEvent = (
  eventName: string,
  eventParams?: Record<string, any>
): void => {
  const measurementId = getGA4Id();
  if (!measurementId || typeof window === 'undefined' || !window.gtag) {
    return;
  }

  window.gtag('event', eventName, {
    ...eventParams,
    send_to: measurementId
  });
};
