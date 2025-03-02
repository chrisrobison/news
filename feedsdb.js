// IndexedDB for offline feeds storage
class FeedsDB {
  constructor() {
    this.DB_NAME = 'tech-news-dashboard';
    this.DB_VERSION = 1;
    this.FEEDS_STORE = 'feeds';
    this.ARTICLES_STORE = 'articles';
    this.db = null;
    this.dbPromise = this.initDB();
  }

  async initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = (event) => {
        console.error('IndexedDB error:', event.target.error);
        reject('Error opening database');
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        console.log('Database opened successfully');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create feeds store
        if (!db.objectStoreNames.contains(this.FEEDS_STORE)) {
          const feedsStore = db.createObjectStore(this.FEEDS_STORE, { keyPath: 'id', autoIncrement: true });
          feedsStore.createIndex('url', 'url', { unique: true });
          feedsStore.createIndex('name', 'name', { unique: false });
          feedsStore.createIndex('lastUpdated', 'lastUpdated', { unique: false });
        }

        // Create articles store
        if (!db.objectStoreNames.contains(this.ARTICLES_STORE)) {
          const articlesStore = db.createObjectStore(this.ARTICLES_STORE, { keyPath: 'id', autoIncrement: true });
          articlesStore.createIndex('feedId', 'feedId', { unique: false });
          articlesStore.createIndex('link', 'link', { unique: true });
          articlesStore.createIndex('pubDate', 'pubDate', { unique: false });
        }
      };
    });
  }

  async saveFeed(feed) {
    await this.dbPromise;
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.FEEDS_STORE], 'readwrite');
      const store = transaction.objectStore(this.FEEDS_STORE);
      
      // Add timestamp
      feed.lastUpdated = new Date().toISOString();
      
      const request = store.put(feed);
      
      request.onsuccess = (event) => {
        resolve(event.target.result);
      };
      
      request.onerror = (event) => {
        console.error('Error saving feed:', event.target.error);
        reject(event.target.error);
      };
    });
  }

  async getAllFeeds() {
    await this.dbPromise;
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.FEEDS_STORE], 'readonly');
      const store = transaction.objectStore(this.FEEDS_STORE);
      const request = store.getAll();
      
      request.onsuccess = (event) => {
        resolve(event.target.result);
      };
      
      request.onerror = (event) => {
        console.error('Error getting feeds:', event.target.error);
        reject(event.target.error);
      };
    });
  }

  async saveArticles(articles, feedId) {
    await this.dbPromise;
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.ARTICLES_STORE], 'readwrite');
      const store = transaction.objectStore(this.ARTICLES_STORE);
      
      let successCount = 0;
      
      articles.forEach(article => {
        // Add feedId reference
        article.feedId = feedId;
        
        // Ensure we have a Date object for pubDate
        if (typeof article.date === 'string') {
          article.pubDate = new Date(article.date).toISOString();
        } else if (article.date instanceof Date) {
          article.pubDate = article.date.toISOString();
        }
        
        const request = store.put(article);
        
        request.onsuccess = () => {
          successCount++;
          if (successCount === articles.length) {
            resolve(successCount);
          }
        };
        
        request.onerror = (event) => {
          console.error('Error saving article:', event.target.error);
          // Continue with other articles
        };
      });
      
      transaction.oncomplete = () => {
        resolve(successCount);
      };
      
      transaction.onerror = (event) => {
        console.error('Transaction error:', event.target.error);
        reject(event.target.error);
      };
    });
  }

  async getArticlesByFeed(feedId) {
    await this.dbPromise;
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.ARTICLES_STORE], 'readonly');
      const store = transaction.objectStore(this.ARTICLES_STORE);
      const index = store.index('feedId');
      const request = index.getAll(feedId);
      
      request.onsuccess = (event) => {
        resolve(event.target.result);
      };
      
      request.onerror = (event) => {
        console.error('Error getting articles:', event.target.error);
        reject(event.target.error);
      };
    });
  }

  async getAllArticles() {
    await this.dbPromise;
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.ARTICLES_STORE], 'readonly');
      const store = transaction.objectStore(this.ARTICLES_STORE);
      const request = store.getAll();
      
      request.onsuccess = (event) => {
        resolve(event.target.result);
      };
      
      request.onerror = (event) => {
        console.error('Error getting all articles:', event.target.error);
        reject(event.target.error);
      };
    });
  }

  async deleteFeed(feedId) {
    await this.dbPromise;
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.FEEDS_STORE, this.ARTICLES_STORE], 'readwrite');
      const feedsStore = transaction.objectStore(this.FEEDS_STORE);
      const articlesStore = transaction.objectStore(this.ARTICLES_STORE);
      const feedIndex = articlesStore.index('feedId');
      
      // First, get all articles for this feed
      const articlesRequest = feedIndex.getAll(feedId);
      
      articlesRequest.onsuccess = (event) => {
        const articles = event.target.result;
        
        // Delete each article
        articles.forEach(article => {
          articlesStore.delete(article.id);
        });
        
        // Delete the feed
        feedsStore.delete(feedId);
      };
      
      transaction.oncomplete = () => {
        resolve(true);
      };
      
      transaction.onerror = (event) => {
        console.error('Error deleting feed:', event.target.error);
        reject(event.target.error);
      };
    });
  }

  async updateFeedLastUpdated(feedId) {
    await this.dbPromise;
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.FEEDS_STORE], 'readwrite');
      const store = transaction.objectStore(this.FEEDS_STORE);
      
      // First, get the feed
      const getRequest = store.get(feedId);
      
      getRequest.onsuccess = (event) => {
        const feed = event.target.result;
        if (feed) {
          feed.lastUpdated = new Date().toISOString();
          
          // Update the feed
          const updateRequest = store.put(feed);
          
          updateRequest.onsuccess = () => {
            resolve(true);
          };
          
          updateRequest.onerror = (event) => {
            console.error('Error updating feed:', event.target.error);
            reject(event.target.error);
          };
        } else {
          reject(new Error('Feed not found'));
        }
      };
      
      getRequest.onerror = (event) => {
        console.error('Error getting feed:', event.target.error);
        reject(event.target.error);
      };
    });
  }

  async getPendingSyncFeeds() {
    await this.dbPromise;
    
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - (60 * 60 * 1000));
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.FEEDS_STORE], 'readonly');
      const store = transaction.objectStore(this.FEEDS_STORE);
      const request = store.getAll();
      
      request.onsuccess = (event) => {
        const feeds = event.target.result;
        
        // Filter feeds that haven't been updated in the last hour
        const pendingFeeds = feeds.filter(feed => {
          const lastUpdated = new Date(feed.lastUpdated || 0);
          return lastUpdated < oneHourAgo;
        });
        
        resolve(pendingFeeds);
      };
      
      request.onerror = (event) => {
        console.error('Error getting pending feeds:', event.target.error);
        reject(event.target.error);
      };
    });
  }
}

// Export as global variable
window.FeedsDB = FeedsDB;
