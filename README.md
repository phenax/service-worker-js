# ServiceWorkersJS

Service worker recipe library


### Usage

* Import the library
```javascript
importScripts([ '../service-worker.js' ]);
```

* Create the service worker instance
```javascript
const sw= new ServiceWorkerJS();
```

* Simple routing

```javascript

// Custom recipe
sw.addRoute('script.js', { method: 'get' }, e => { /* Do some stuff and return a promise */ });

// Use cache first recipe for style.css file
// (The responses from the network will be cached in 'cache-scripts')
sw.addRoute('style.css', { method: 'get' }, sw.cacheFirst({ cache: 'cache-styles' }));

// Use network only recipe for main.js file
// (The timeout for the request is 4seconds(10 seconds by default))
sw.addRoute('main.js', { method: 'get' }, sw.networkOnly({ timeout: 4000 }));

```