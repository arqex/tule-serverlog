'use strict';

var config = require('config'),
	qdb = config.require('qdb'),
	readline = require('readline'),
	fs = require('fs-reverse'),
	Writable = require('stream').Writable,
	Q = require('q')
;

var bufferLimit = 100;

var buffers = {
	console: []
};

var timers = {},
	bufferLife = 10 * 60000 // ten minutes
;

var getBuffer = function( path ){
	var b = buffers[path];

	if( !b )
		b = buffers[path] = [];

	if( timers[path] )
		clearTimeout( timers[path] );

	timers[path] = setTimeout( function(){
		delete buffers[path];
		delete timers[path];
	}, bufferLife );

	return b;
};

var readFile = function( path, lastTime ){
	var deferred = Q.defer();

	var b = getBuffer( path ),
		ws = new Writable(),
		lines = [],
		rs,
		repeated = 0,
		maxRepeatedLines = 3,
		now = Date.now()
	;

	try {
		rs = fs( path, {encoding: 'utf8'} );
	}
	catch (e) {
		return Q.reject( e );
	}

	ws._write = function( chunk, enc, next ){
		var line = chunk.toString('utf8');

		if( !line.length )
			return next();

		lines.push( {timestamp: now, line:line} );

		// If we got some number of line that matches
		// the last lines of the buffer, we have reached
		// the buffer point
		if( !b[repeated] || line != b[repeated].line )
			repeated = 0;
		else {
			repeated++;
			if( repeated >= maxRepeatedLines )
				return rs.destroy();
		}

		// If the number of line reaches the buffer limit, destroy it
		if( lines.length >= bufferLimit )
			return rs.destroy();

		next();
	};

	rs.pipe( ws );
	rs.on('close', function(){
		b = lines.slice(0, lines.length - repeated)
			.concat( b )
			.slice( 0, bufferLimit )
		;

		buffers[ path ] = b;

		deferred.resolve( b );
	});

	return deferred.promise;
};

// Hijack the console
var oriStdout = process.stdout.write;
process.stdout.write = function( line ){
	var b = buffers.console;
	b.unshift({timestamp: Date.now(), line: line});
	if( b.length > bufferLimit )
		b.pop();

	oriStdout.call(process.stdout, line );
};

var getNewLines = function( buffer, lastTime ){
	if( !lastTime )
		return buffer;

	var i = 0,
		current = buffer[ i++ ],
		newLines = []
	;

	while( current && current.timestamp > lastTime ){
		newLines.push( current );
		current = buffer[ i++ ];
	}

	return newLines;
};

module.exports = {
	getLogs: function( req, res ){
		var time = parseInt( req.param('lastTime') ) || false,
			file = req.param('file'),
			buffer = file ? buffers[ file ] : buffers.console,
			lastLine
		;

		if( file ){
			if( !buffer )
				buffer = buffers[ file ] = [];

			if( buffer.length )
				lastLine = buffer[0];

			return readFile( file, lastLine )
				.then( function( b ){
					res.json( getNewLines( b, time ) );
				})
				.catch( function( err ){
					console.log( err.stack );
					res.json( {error: 'Not found'} );
				})
			;
		}

		return res.json( getNewLines( buffer, time ) );
	}
};