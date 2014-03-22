/* global casper, phantomcss */

/* IMPORTANT: FIRST RUN 'grunt dev' TO START OUR TESTING WEBSERVER */

casper.start('http://localhost:9901');

casper.thenOpen('http://localhost:9901/src/_docs/responsive-image.html').then(function() {
	"use strict";

	casper.wait(20, function () {
		phantomcss.screenshot('.docs-example', 'Responsive image');
	});

}).thenOpen('http://localhost:9901/src/_docs/styling.html').then(function() {
	"use strict";
	// casper.click('.demo-title');
	phantomcss.screenshot('.docs-example', 'Style components');
});