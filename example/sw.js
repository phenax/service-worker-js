
/*eslint no-undef: "off"*/

// Import the library
importScripts([ '../service-worker.js' ]);


const sw= new ServiceWorkerJS();

// List of files to precache
sw.precache('precache', [
	'/example/'
]);

sw.onPushNotification= () => {
	console.log('pushed');
};


// Simple fetch
// sw.addRoute('script-1.js', { method: 'get' }, e => fetch(e.request));
// Same as...
// sw.addRoute(new SWRoute('script-1.js', { method: 'get' }, e => fetch(e.request)));

// Chain multiple controllers (must return promises)
// sw.addRoute('script-1.js', { method: 'get' }, 
	// e => Promise.resolve(), 
	// e => fetch(e.request)
// );


// CacheFirst recipe for script-1
sw.addRoute('script-1.js', { method: 'get' }, sw.cacheFirst({ cache: 'cache-scripts' }));

// NetworkOnly recipe for script-2
// sw.addRoute(/script-2\.js$/, { method: 'get' }, sw.networkOnly({ timeout: 3000 }));

// Race recipe for script-2
// sw.addRoute(/script-2\.js$/, { method: 'get' }, sw.race({ cache: 'cache-scripts', timeout: 3000 }));
sw.addRoute(/script-2\.js$/, { method: 'get' }, sw.networkFirst({ cache: 'cache-scripts', timeout: 3000 }));

// CacheOnly recipe for /example/ 
// (Will respond with the default response if its not precached)
sw.addRoute(/\/example\/$/, { method: 'get' }, sw.cacheOnly({ default: new Response('Dummy response') }));



