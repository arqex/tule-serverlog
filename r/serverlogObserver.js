
define(['jquery', 'text!./tuleServerlog.html', 'css!./tuleServerlog.css'], function( $, tplSource ){
	'use strict';

	var s = document.createElement('script');
	s.type = 'text/javascript';
	s.src = '/r/serverlog/bower_components/webcomponentsjs/webcomponents.min.js';
	document.body.appendChild(s);

	var container = document.createElement('div');

	container.id = 'serverlogContainer';
	container.innerHTML = tplSource;
	document.body.appendChild(container);

	$('.js-toggle-viewer').on('click', function(){
		$(container).toggleClass('open');
	});
});