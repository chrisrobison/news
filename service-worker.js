// Service Worker for Tech News Dashboard
const CACHE_NAME = 'tech-news-dashboard-v1';
const APP_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png'
];

// Install event - cache app shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(APP_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
          return null;
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin) &&
      !event.request.url.includes('news.php')) {
    return;
  }

  // For news feed requests (either direct or through the proxy)
  if (event.request.url.includes('news.php') || 
      event.request.url.includes('feed') || 
      event.request.url.includes('rss')) {
    
    event.respondWith(
      // Try network first, then fallback to cache
      fetch(event.request)
        .then((response) => {
          // Cache the fresh response
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              // Only cache successful responses
              if (response.status === 200) {
                cache.put(event.request, responseToCache);
              }
            });
          return response;
        })
        .catch(() => {
          // If network fails, try to serve from cache
          return caches.match(event.request);
        })
    );
  } else {
    // For other requests (app shell assets)
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          // Cache hit - return response
          if (response) {
            return response;
          }
          // No cache match, fetch from network
          return fetch(event.request)
            .then((response) => {
              // Check if we received a valid response
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }
              
              // Clone the response
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
              
              return response;
            });
        })
    );
  }
});

// Add background sync for offline feed fetching
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-news-feeds') {
    event.waitUntil(syncNewsFeeds());
  }
});

// Listen for messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CACHE_FEEDS') {
    // Cache the feeds passed from the main thread
    event.waitUntil(cacheFeedsData(event.data.feeds));
  }
});

// Function to cache feed data received from the main thread
async function cacheFeedsData(feedsData) {
  try {
    const cache = await caches.open('feeds-cache');
    await cache.put(
      new Request('cached-feeds-data'),
      new Response(JSON.stringify(feedsData), {
        headers: { 'Content-Type': 'application/json' }
      })
    );
    console.log('Feeds data cached successfully');
  } catch (error) {
    console.error('Error caching feeds data:', error);
  }
}

// Function to sync news feeds when back online
async function syncNewsFeeds() {
  try {
    // Get the list of feeds to fetch from IndexedDB
    const feedsToSync = await getOfflinePendingFeeds();
    
    // Fetch each feed and update the cache
    const fetchPromises = feedsToSync.map(async (feed) => {
      try {
        const response = await fetch(feed.url);
        const cache = await caches.open(CACHE_NAME);
        await cache.put(new Request(feed.url), response.clone());
        
        // Mark this feed as synced
        await markFeedAsSynced(feed.id);
        
        return response.text();
      } catch (error) {
        console.error(`Failed to sync feed: ${feed.name}`, error);
        return null;
      }
    });
    
    await Promise.all(fetchPromises);
    
    // Notify all clients about the successful sync
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'FEEDS_SYNCED',
        timestamp: new Date().toISOString()
      });
    });
    
  } catch (error) {
    console.error('Error during feed sync:', error);
  }
}

// Placeholder function - would need to implement with IndexedDB
async function getOfflinePendingFeeds() {
  // In a real implementation, this would access IndexedDB
  // For now, return an empty array
  return [];
}

// Placeholder function - would need to implement with IndexedDB
async function markFeedAsSynced(feedId) {
  // In a real implementation, this would update IndexedDB
  console.log(`Feed ${feedId} marked as synced`);
}
