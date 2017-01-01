
/*eslint no-unused-vars: "off"*/

const _self= self;



/**
 * Route to check for matching requests
 *
 * @extends {Map}
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

		// All the routes with no cache name will be stored in this
		this.DEFAULT_CACHE_NAME= 'cache-default-swjs';

		this._routes= [];
		this._precacheList= [];

		// Attach event handlers
		_self.addEventListener('fetch', this._onFetchHandler.bind(this));
		_self.addEventListener('install', this._onInstallHandler.bind(this));
	}



	/**
	 * Add files precaching
	 * 
	 * @param  {string}  cacheName     Name of the cache to store it in
	 * @param  {List}    precacheList  List of file names
	 */
	precache(cacheName, precacheList) {
		this._precacheList.push({
			cacheName,
			files: precacheList
		});
	}


	/**
	 * Adds a route for fetch
	 * 
	 * @param {String|RegExp|SWRoute}  route       The route
	 * @param {object|null}            config      Configuration for the router
	 * @param {...Function|null}       controllers The controllers(@param event. @return {Response})
	 */
	addRoute(route, config, ...controllers) {

		// If SWRoute is passed directly
		if(route.constructor === SWRoute)
			this._routes.push(route);
		else
			this._routes.push(new SWRoute(route, config, ...controllers));
	}


	/**
	 * Install event handler
	 * 
	 * @param  {InstallEvent} event
	 */
	_onInstallHandler(event) {

		event.waitUntil(

			// Wait to add all the caches
			Promise.all(

				// for all the caches
				this._precacheList
					.map(preCache => 
						caches
							.open(preCache.cacheName)
							.then(cache => cache.addAll(preCache.files))
					)
			)
		);
	}


	/**
	 * Fetch event handler
	 * 
	 * @param  {FetchEvent}  event  The fetch event made by the browser
	 */
	_onFetchHandler(event) {

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


	/**
	 * Fetches and caches the response
	 * 
	 * @param  {Request}   request
	 * @param  {string}    cacheName  The name of the cache to put the response in
	 * @return {Response}             Response promise
	 */
	fetch(request, cacheName=this.DEFAULT_CACHE_NAME) {

		// Make a fetch request
		return fetch(request)
			.then(resp => 
				caches
					.open(cacheName)
					.then(cache => {

						// Cache the response
						cache.put(request, resp.clone());

						return resp;
					})
			)
			.catch(e => console.error(e));
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







	// ##############  RECIPIES  ##################


	race(config) {

		const cacheOnly= e => new Promise((resolve, reject) => {
			this.cacheOnly(config)(e)
				.then(resolve)
				.catch(() => null);
		});

		const networkOnly= e => new Promise((resolve, reject) => {
			this.networkOnly(config)(e)
				.then(resolve)
				.catch(() => null);
		});

		return e => Promise.race([ cacheOnly(e), networkOnly(e) ]);
	}


	/**
	 * Cache first recipe
	 * 
	 * @param  {Object}   config  Configuration object
	 * 
	 * @return {Function}         Fn that returns a promise
	 */
	cacheFirst(config) {

		return e => 
			this
				.searchCache(e.request)
				.then(response => response || this.fetch(e.request, config.cache));
	}


	/**
	 * Cache only recipe
	 * 
	 * @param  {Object} config
	 * 
	 * @return {Function}
	 */
	cacheOnly(config) {

		return e => 
			this
				.searchCache(e.request)            // Look for it in the cache
				.then(response => 
					response || (                  // If it wasnt found, either return a default response or an error
						(config.default)?
							config.default: 
							Promise.reject(new Error('Cache not found'))
					)
				);
	}


	/**
	 * Network only recipe
	 * 
	 * @param  {Object}    config
	 * 
	 * @return {Function}
	 */
	networkOnly(config) {

		return e => new Promise((resolve, reject) => {

			// Network request timeout check
			setTimeout(() => reject(new Error('Request timeout')), config.timeout || 10000);

			// Make the request
			fetch(e.request)
				.then(resolve)
				.catch(reject);
		});
	}
}
