
/*eslint no-unused-vars: "off"*/

const _self= self;



/**
 * Route to check for matching requests
 */
class SWRoute extends Map {

	constructor(route, config, ...controllers) {
		super();

		this.set('route', route);
		this.set('config', config);
		this.set('controllers', controllers);
	}

	/**
	 * Checks if a request matches this route
	 * 
	 * @param  {Request}  request  The request made
	 * 
	 * @return {boolean}           True if the request matches
	 */
	match(request) {

		const route= this.get('route');
		const config= this.get('config');

		// Request method check
		if('method' in config) {
			if(request.method.toLowerCase() !== config.method.toLowerCase())
				return false;
		}

		// Request url check
		if(typeof route === 'string') {
			return request.url.endsWith(route);  // For strings
		} else if('test' in route) {
			return route.test(request.url);      // For regular expressions
		}

		return false;
	}
}



/**
 * Service worker JS
 */
class ServiceWorkerJS {

	constructor() {

		this.DEFAULT_CACHE_NAME= 'cache-default-swjs';

		this._routes= [];

		this._fetchHandler= this._fetchHandler.bind(this);

		_self.addEventListener('fetch', this._fetchHandler);
	}


	/**
	 * Adds a route for fetch
	 * 
	 * @param {String|RegExp|SWRoute}  route       The route
	 * @param {object|null}            config      Configuration for the router
	 * @param {...Function|null}       controllers The controllers(@param event. @return {Response})
	 */
	addRoute(route, config, ...controllers) {

		if(route.constructor === SWRoute)
			this._routes.push(route);
		else
			this._routes.push(new SWRoute(route, config, ...controllers));
	}


	/**
	 * Fetch event handler
	 * 
	 * @param  {FetchEvent}  event  The fetch event made by the browser
	 */
	_fetchHandler(event) {

		// Response promise
		let response_P= null;

		// For each route
		this._routes
			.filter(route => route.match(event.request))                      // Get the ones that match the request made
			.forEach(route =>
				route                                                         // For each controller
					.get('controllers')
					.filter(ctrlr => typeof ctrlr === 'function')             // If its a function, let it through
					.forEach(ctrlr => {
						if(response_P && 'then' in response_P) {              // If its a promise, call controller after it resolves
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

	fetch(request, cacheName=this.DEFAULT_CACHE_NAME) {

		return fetch(request)
			.then(resp => caches
				.open(cacheName)
				.then(cache => {

					cache.put(request, resp.clone());

					return resp;
				})
			);
	}


	/**
	 * Search in the cache for a request
	 * 
	 * @param  {Request} request
	 * 
	 * @return {Response}
	 */
	searchCache(request) {
		return caches
			.match(request)
			.catch(e => console.error(e));
	}


	/**
	 * Cache first recipe
	 * 
	 * @param  {FetchEvent} e   Event for onfetch
	 * 
	 * @return {Response}       Response promise
	 */
	cacheFirst(config) {

		return e => this
			.searchCache(e.request)
			.then(response => {
				return response || this.fetch(e.request, config.cache);
			});
	}
}
