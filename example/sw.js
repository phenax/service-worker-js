
/*eslint no-undef: "off"*/

importScripts([ '../service-worker.js' ]);


const precacheList= [
	'script-1.js',
	'script-2.js'
];

const sw= new ServiceWorkerJS();

// sw.addRoute('script-1.js', { method: 'get' }, e => fetch(e.request));
// Same as...
// sw.addRoute(new SWRoute('script-1.js', { method: 'get' }, e => fetch(e.request)));


sw.precache('precache', precacheList);

sw.addRoute('.js', { method: 'get' }, sw.cacheFirst({ cache: 'cache-scripts' }));


