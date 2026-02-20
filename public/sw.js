// Ocean Hazard Reporting Platform - Service Worker
// Provides offline functionality and caching for PWA

const CACHE_NAME = 'pralay-v3';

self.addEventListener('install', (event) => {
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
  try {
    // Get offline reports from IndexedDB
    const reports = await getOfflineReports();
    
    for (const report of reports) {
      try {
        // Attempt to submit each report
        const response = await fetch('/api/reports', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: "include",
          body: JSON.stringify(report)
        });
        
        if (response.ok) {
          // Remove successfully synced report from local storage
          await removeOfflineReport(report.id);
          console.log('Report synced:', report.id);
        }
      } catch (error) {
        console.error('Failed to sync report:', report.id, error);
      }
    }
  } catch (error) {
    console.error('Error during background sync:', error);
  }
}

// Helper functions for IndexedDB operations (simplified)
async function getOfflineReports() {
  // In a real implementation, this would use IndexedDB
  return JSON.parse(localStorage.getItem('offline-reports') || '[]');
}

async function removeOfflineReport(reportId) {
  // In a real implementation, this would use IndexedDB
  const reports = JSON.parse(localStorage.getItem('offline-reports') || '[]');
  const filteredReports = reports.filter(report => report.id !== reportId);
  localStorage.setItem('offline-reports', JSON.stringify(filteredReports));
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
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/offline.html');
      })
    );
  }
});