const CACHE_VERSION = 'vajra-v5';
const CACHE_NAME = CACHE_VERSION;

// All assets that should be available offline immediately
const APP_SHELL = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
];

// ─── Install: pre-cache app shell, skip waiting immediately ──────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.allSettled(APP_SHELL.map(url =>
        cache.add(url).catch(() => {/* ignore missing assets */})
      ));
    }).then(() => self.skipWaiting()),
  );
});

// ─── Activate: clean up old caches, claim clients, notify of update ──────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME && key !== 'vajra-schedules')
          .map(key => caches.delete(key)),
      ),
    ).then(() => self.clients.claim()).then(() => {
      return self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
        for (const client of clients) {
          client.postMessage({ type: 'SW_UPDATED', version: CACHE_VERSION });
        }
      });
    }),
  );
});

// ─── Message: handle SKIP_WAITING and SHOW_NOTIFICATION from client ──────────
self.addEventListener('message', event => {
  if (!event.data) return;

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  // Fire a real SW notification (works even when app is in background/closed)
  if (event.data.type === 'SHOW_NOTIFICATION') {
    const { title, body, icon, tag, data } = event.data;
    event.waitUntil(
      self.registration.showNotification(title, {
        body: body || '',
        icon: icon || '/icons/icon-192.svg',
        badge: '/icons/icon-192.svg',
        tag: tag || 'vajra-notification',
        data: data || {},
        renotify: true,
        requireInteraction: false,
        silent: false,
      })
    );
  }

  // Schedule a notification at a future time via SW
  if (event.data.type === 'SCHEDULE_NOTIFICATION') {
    const { id, title, body, icon, tag, delayMs } = event.data;
    event.waitUntil(
      (async () => {
        const scheduleCache = await caches.open('vajra-schedules');
        const schedule = { id, title, body, icon, tag, firesAt: Date.now() + delayMs };
        await scheduleCache.put(
          new Request(`/sw-schedule/${id}`),
          new Response(JSON.stringify(schedule), { headers: { 'content-type': 'application/json' } })
        );
      })()
    );
  }
});

// ─── Fetch: cache-first for EVERYTHING — app works fully offline ─────────────
// All data is in localStorage (Zustand persist). No network needed for app data.
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin requests
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  // SPA navigation: always serve cached index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match('/').then(cached => {
        if (cached) return cached;
        return fetch(request).then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put('/', clone));
          }
          return response;
        }).catch(() =>
          new Response('<!doctype html><html><body><script>location.href="/"</script></body></html>', {
            headers: { 'content-type': 'text/html' },
          })
        );
      })
    );
    return;
  }

  // Cache-first for all static assets — with network fallback and background update
  event.respondWith(
    caches.match(request).then(cached => {
      const networkFetch = fetch(request).then(response => {
        if (response && response.status === 200 && response.type !== 'opaque') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        }
        return response;
      }).catch(() => null);

      // Return cache immediately if available, otherwise wait for network
      return cached || networkFetch || new Response('', { status: 503 });
    }),
  );
});

// ─── Notification click: open or focus app ────────────────────────────────────
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const targetUrl = event.notification.data?.url ?? '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      for (const client of clients) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    }),
  );
});
