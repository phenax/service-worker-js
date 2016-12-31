
/*eslint no-undef: "off"*/

importScripts([ '../service-worker.js' ]);


const sw= new ServiceWorkerJS({

});

sw.addRoute('script-1.js', e => fetch(e.request));
