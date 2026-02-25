// Ocean Hazard Reporting Platform - Service Worker
// Provides offline functionality and caching for PWA

importScripts('/idb.js');

const dbPromise = idb.openDB('pralay-offline-db', 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains('reports')) {
      db.createObjectStore('reports', { keyPath: 'id' });
    }
  },
});

async function getOfflineReports() {
  const db = await dbPromise;
  return db.getAll('reports');
}

async function removeOfflineReport(id) {
  const db = await dbPromise;
  await db.delete('reports', id);
}

const CACHE_NAME = 'pralay-v5';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/offline.html',
      ]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});


// Background sync for offline report submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync-reports') {
    event.waitUntil(syncReports());
  }
});

// Function to sync offline reports when connection is restored
async function syncReports() {
  const reports = await getOfflineReports();


  for (const report of reports) {
    try {
      const response = await fetch(
        'https://pralay-backend-1.onrender.com/api/submit-hazard-report/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': report.token ? `Bearer ${report.token}` : '',
          },
          body: JSON.stringify(report.data),
        }
      );
      
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log("Server rejected:", errorText);
        continue;
      }
      
      await removeOfflineReport(report.id);
      console.log("Synced:", report.id);
      console.log("Manual or background sync triggered");

    } catch (err) {
      console.log('Still offline. Will retry later.');
    }
  }
}


// Push notification handling
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey || 1
      },
      actions: [
        {
          action: 'explore',
          title: 'View Details',
          icon: '/icon-192.png'
        },
        {
          action: 'close',
          title: 'Close',
          icon: '/icon-192.png'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    // Open the app to the relevant page
    event.waitUntil(
      clients.openWindow('/dashboard')
    );
  }
});

self.addEventListener('fetch', (event) => {

  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request)
          .then((networkResponse) => {
            return caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            });
          });
      })
      .catch(() => {
        // Always return a valid Response
        if (event.request.mode === 'navigate') {
          return caches.match('/offline.html');
        }

        return new Response('', {
          status: 503,
          statusText: 'Service Unavailable',
        });
      })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SYNC_REPORTS') {
    event.waitUntil(syncReports());
  }
});