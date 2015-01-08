'use strict';

var config = require('config'),
	logger = require('winston'),
	Q = require('q')
;

var settings, db, loginMiddleware;

module.exports = {
	init: function(hooks){
		hooks.addFilter('settings:get:routes:static', function(routes){
			console.log( 'inited' );
			routes.push({url: 'serverlog', path: 'tule-serverlog/r'});
			return routes;
		});

		hooks.addFilter('settings:get:frontend:observers', function( observers ){
			observers.push('../serverlog/serverlogObserver');
			return observers;
		});

		hooks.addFilter('settings:get:routes:server', function(routes){

			//The splice is necessary to add the route before the default one.
			routes.splice(-1, 0,
				{route: 'get::/getLogs' , controller: '/tule-serverlog/actions/logDispatcher::getLogs'}
			);
			return routes;
		});
	}
};