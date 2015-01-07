'use strict';

var config = require('config'),
	qdb = config.require('qdb'),
	readline = require('readline'),
	fs = require('fs')
;

var bufferLimit = 100;

var buffers = {
	console: []
};

var oriStdout = process.stdout.write;

var readLine = function( contents, offset ){
	var os = offset || 0,
		i = contents.length - offset - 1,
		line = [],
		current
	;

	if( i >= 0 )
		current = contents[i--];

	while( i>=0 && current != '\n' ){
		line = current + line;
		current = contents[i--];
	}

	return {contents: line, offset: i};
};

var readFile = function( path, lastLine, clbk ){
	fs.readFile( path, function( err, contents ){

	});
};

process.stdout.write = function( line ){
	var b = buffers.console;
	b.unshift({timestamp: Date.now(), line: line});
	if( b.length > bufferLimit )
		b.pop();

	oriStdout.call(process.stdout, line );
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

			return readFile(file, lastLine, function(){

			});
		}

		if( !time )
			return res.json( buffer );

		var i = 0,
			current = buffer[ i++ ],
			toSend = []
		;

		while( current && current.timestamp > time ){
			toSend.push( current );
			current = buffer[ i++ ];
		}

		return res.json( toSend );
	}
};