# Tech News Dashboard

A lightweight, customizable RSS and news feed dashboard for keeping up with your favorite tech news sources. Built with vanilla JavaScript, HTML, and CSS, this application requires no build steps or dependencies to run.

![Tech News Dashboard Screenshot](https://via.placeholder.com/800x450?text=Tech+News+Dashboard+Screenshot)

## Features

- **Multiple News Source Support**: Aggregates feeds from various tech news sites
- **RSS and JSON Feed Support**: Compatible with both RSS feeds and JSON API endpoints
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark/Light Mode**: Toggle between themes with automatic system preference detection
- **Custom Feed Management**: Add, edit, and remove your preferred news sources
- **Progressive Web App (PWA)**: Install on your device and access from the home screen
- **Offline Support**: Full offline functionality with cached news articles
- **Background Sync**: Automatically fetches new content when you're back online
- **IndexedDB Storage**: Efficiently stores your feeds and articles for offline access
- **CORS Proxy**: Built-in proxy handling for cross-origin requests
- **No Dependencies**: Pure vanilla JavaScript with no external libraries required

## Getting Started

### Quick Start

1. Clone this repository or download the ZIP file
2. Open `index.html` in your web browser
3. That's it! No build process, no npm install

### Install as a Progressive Web App (PWA)

1. Visit the application in a modern browser (Chrome, Edge, Firefox, etc.)
2. You'll see an install prompt in the address bar or menu
3. Click "Install" to add the app to your device
4. The app will now be available from your home screen or app launcher
5. Enjoy full offline capabilities with automatic background syncing!

### Using the Dashboard

The dashboard comes pre-configured with several popular tech news sources:

- Mozilla Blog
- CSS Tricks
- Hacker News
- The Verge Tech
- TechCrunch
- Ars Technica

You can immediately start reading the latest news from these sources or customize the dashboard with your own preferred news feeds.

## Customizing Your News Sources

### Adding a News Source

1. Click the "Add Source" button in the dashboard header
2. Enter the source details:
   - **Source Name**: A friendly name for the feed (e.g., "My Tech Blog")
   - **Feed URL**: The direct link to the RSS feed or JSON endpoint
   - **Feed Type**: Select RSS or JSON
   - **Query Parameter**: Optional parameters needed for some feeds (e.g., "x=hn" for Hacker News)
3. Click "Add Source" to save

### Managing News Sources

1. Click the "Manage Sources" button in the dashboard header
2. View all your current feeds (default feeds are highlighted with a blue border, custom feeds with a green border)
3. Edit any feed by clicking the "Edit" button
4. Delete custom feeds with the "Delete" button (note: default feeds cannot be permanently deleted)

:

- Fetching and parsing feeds
- Managing user preferences
- Rendering the UI
- Handling user interactions

### Feed Processing

- **RSS Feeds**: Parsed using the built-in DOMParser
- **JSON Feeds**: Handled with standard JSON parsing
- **CORS Issues**: Automatically routed through a proxy for cross-origin resources

### Data Storage

The application uses multiple storage mechanisms for different types of data:

- **IndexedDB**: Stores feed configurations and article content for offline use
  - `feeds` store: Contains feed URLs, names, and metadata
  - `articles` store: Contains all articles from each feed with references to their parent feed
- **localStorage**: Stores user preferences and settings
  - Custom feeds: Stored under `customNewsSources` key
  - Theme preference: Stored under `theme` key
- **Cache Storage API**: The service worker caches static assets and feed responses for offline access

### Offline Capabilities

The application is designed to work seamlessly offline:

1. **Service Worker**: Intercepts network requests and serves cached responses when offline
2. **Background Sync**: Queues feed update requests when offline and processes them when connectivity returns
3. **Cached Content**: Automatically falls back to previously cached articles when feeds can't be reached
4. **Visual Indicators**: Shows when content is being served from cache vs. fresh from the network

### Adding Your Own CORS Proxy

If you want to use a different CORS proxy:

1. Open the source code
2. Locate the `CORS_PROXY` property in the `NewsDashboard` constructor
3. Replace it with your preferred proxy URL

Example:
```javascript
this.CORS_PROXY = 'https://your-proxy-service.com/proxy?url=';
```

## Browser Compatibility

This dashboard works with all modern browsers including:

- Chrome/Edge (latest versions)
- Firefox (latest versions)
- Safari (latest versions)
- Mobile browsers (iOS Safari, Chrome for Android)

## Customization

### CSS Variables

The dashboard uses CSS variables for easy styling customization. Major style elements are defined in the `:root` selector at the top of the CSS section.

### Adding More Default Feeds

To add more default feeds, modify the `DEFAULT_FEEDS` array in the `NewsDashboard` constructor.

## License

This project is released under the MIT License - feel free to use, modify, and distribute as you see fit.

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests for improvements or bug fixes.

## Acknowledgments

- Inspired by the need for a simple, lightweight news aggregator
- Thanks to all the news sources that provide open RSS and JSON feeds

---

Developed with ❤️  by Christopher Robison &lt;cdr@cdr2.com&gt;
