
/*eslint no-undef: "off"*/

importScripts([ '../service-worker.js' ]);


const sw= new ServiceWorkerJS({
	precache: [
		
	]
});

sw.addRoute('script-1.js', { method: 'get' }, e => fetch(e.request));
// Same as...
// sw.addRoute(new SWRoute('script-1.js', { method: 'get' }, e => fetch(e.request)));


