
/*eslint no-undef: "off"*/

importScripts([ '../service-worker.js' ]);


// const precacheList= [
// 	'script-1.js',
// 	'script-2.js'
// ];

const sw= new ServiceWorkerJS();

// sw.precache('precache', precacheList);


// sw.addRoute('script-1.js', { method: 'get' }, e => fetch(e.request));
// Same as...
// sw.addRoute(new SWRoute('script-1.js', { method: 'get' }, e => fetch(e.request)));

// Chain multiple controllers (must return promises)
// sw.addRoute('script-1.js', { method: 'get' }, 
	// e => Promise.resolve(), 
	// e => fetch(e.request)
// );


sw.addRoute('script-1.js', { method: 'get' }, sw.cacheFirst({ cache: 'cache-scripts' }));
sw.addRoute(/script-2\.js$/, { method: 'get' }, sw.networkOnly({ timeout: 3000 }));

sw.addRoute(/\/example\/$/, { method: 'get' }, sw.cacheOnly({ default: 'Dummy response' }));

