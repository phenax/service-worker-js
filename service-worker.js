
/*eslint no-unused-vars: "off"*/

const _self= self;

class SWRoute extends Map {

	constructor(route, config, ...controllers) {
		super();

		this.set('route', route);
		this.set('config', config);
		this.set('controllers', controllers);
	}

	match(request) {

		const route= this.get('route');
		const config= this.get('config');

		// Request method check
		if('method' in config) {
			if(request.method.toLowerCase() !== config.method.toLowerCase())
				return false;
		}

		if(typeof route === 'string') {
			return request.url.endsWith(route);  // For strings
		} else if('test' in route) {
			return route.test(request.url);      // For regular expressions
		}

		return false;
	}
}


/**
 * Service worker class
 */
class ServiceWorkerJS {

	constructor() {

		this._routes= [];

		this._fetchHandler= this._fetchHandler.bind(this);

		_self.addEventListener('fetch', this._fetchHandler);
	}

	addRoute(route, config, ...controllers) {

		if(route.constructor === SWRoute)
			this._routes.push(route);
		else
			this._routes.push(new SWRoute(route, config, ...controllers));
	}

	_fetchHandler(event) {

		let response_P= null;

		// For each route
		this._routes
			.filter(route => route.match(event.request))                      // Get the ones that match the request made
			.forEach(route =>
				route                                                         // For each controller
					.get('controllers')
					.filter(ctrlr => typeof ctrlr === 'function')             // If its a function, let it through
					.forEach(ctrlr => {
						if(response_P && 'then' in response_P) {                            // If its a promise, call controller after it resolves
							response_P= response_P.then(() => ctrlr(event));
						} else {                                              // Else just call the controller
							response_P= ctrlr(event);
						}
					})
			);

		// If the response is a promise, respond with it
		if(response_P && 'then' in response_P) {
			event.respondWith(response_P);
		}
	}

	cacheFirst(e) {

		return caches
			.match(e.request)
			.then(response => {
				return response || fetch(e.request);
			});
	}
}
