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

* Precaching
```javascript
sw.precache('precached-scripts', [
	'/main.js',
	'/vendor.js',
]);
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


// You can directly pass a route object
const scriptRoute= new SWRoute('script-1.js', { method: 'get' }, e => fetch(e.request));
sw.addRoute(scriptRoute);

```


* Push Notification[Not ready]

```javascript

// For handling push notifications
sw.onPushNotification= event => {

	console.log('Got a notification', event);

	// Needs to return a promise that resolves with the notification data
	return Promise.resolve({
		title: 'Got a notification',
		options: {
			body: 'Lorem ipsum for this notification',
			icon: 'img/icon.png',
			badge: 'img/badge.png',
		}
	});
};

```




* Available recipies

	- Race
		Races the network and cache and responds with whatever happens first
		Options- ``` sw.race({ cache: 'cache-scripts', timeout: 3000 }) ```

	- CacheFirst
		Check the cache for the file and if it wasnt present, make a fetch request to the network
		Options- ``` sw.cacheFirst({ cache: 'cache-styles' }) ```

	- NetworkFirst
		Make a fetch request to the network, if something goes wrong, check the cache for the file
		Options- ``` sw.networkFirst({ cache: 'cache-scripts', timeout: 3000 }) ```

	- CacheOnly
		Check the cache for the file and if the file isnt precached, respond with an error or a default response.
		Options- ``` sw.cacheOnly({ default: new Response('Dummy response') }) ```

	- NetworkOnly
		Check the network for a response and respond with an error if it takes more than the timeout period.
		Options- ``` sw.networkOnly({ timeout: 4000 }) ```



