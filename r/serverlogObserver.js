
define(['jquery', 'underscore', 'clientStore', 'text!./tuleServerlog.html', 'css!./tuleServerlog.css'],
	function( $, _, ClientStore, tplSource ){
	'use strict';

	var settingName = 'serverlog';

	// Create client preferences if they are not created
	var preferences = ClientStore.get( settingName );
	if( !preferences ){
		preferences = {open: false};
		ClientStore.set( settingName, preferences );
	}


	var s = document.createElement('script');
	s.type = 'text/javascript';
	s.src = '/r/serverlog/bower_components/webcomponentsjs/webcomponents.min.js';
	document.body.appendChild(s);

	var container = document.createElement('div');

	container.id = 'serverlogContainer';
	container.setAttribute('class', preferences.open ? 'open' : '');
	container.innerHTML = _.template(tplSource, {open: preferences.open });

	$(container).on( 'ready', function(){
		console.log( viewer.runUpdates );
	});

	document.body.appendChild(container);

	var viewer = $(container).find('serverlog-viewer')[0];

	$(window).one( 'polymer-ready', function(){
		console.log( 'Viewer ready' );
	});

	$('.js-toggle-viewer').on('click', function(){
		var $c = $(container);

		$c.toggleClass('open');
		var open = $c.hasClass( 'open' ),
			s = ClientStore.get( settingName )
		;

		s.open = open;

		ClientStore.set( settingName, s );

		viewer.runUpdates( s.open );
	});
});