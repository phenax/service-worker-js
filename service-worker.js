
/*eslint no-unused-vars: "off"*/

const _self= self;

class Route extends Map {

	constructor(route, controllers) {
		super();

		this.set('route', route);
		this.set('controllers', controllers);
	}

	match(request) {

		const route= this.get('route');

		if(typeof route === 'string') {
			return request.url.endsWith(route);
		} else if(typeof route.test === 'function') {
			return route.test(request.url);
		}

		return false;
	}
}

class ServiceWorkerJS {

	constructor(config) {

		this._routes= [];

		this._fetchHandler= this._fetchHandler.bind(this);

		_self.addEventListener('fetch', this._fetchHandler);
	}

	addRoute(route, ...controllers) {
		this._routes.push(new Route(route, controllers));
	}

	_fetchHandler(event) {

		let response_P= null;

		this._routes
			.filter(route => route.match(event.request))
			.forEach(route => 
				route
					.get('controllers')
					.filter(ctrlr => typeof ctrlr === 'function')
					.forEach(ctrlr => {
						if(response_P) {
							response_P= response_P.then(() => ctrlr(event));
						} else {
							response_P= ctrlr(event);
						}
					})
			);

		if(response_P) {
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
