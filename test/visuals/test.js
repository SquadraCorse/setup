/* global casper, phantomcss */

casper.start('http://localhost:9000/docs/responsive-image.html').then(function() {
	"use strict";

	casper.wait(4000, function () {
		phantomcss.screenshot('.docs-example', 'Responsive image');
	});

})
.then(function() {
	"use strict";
	// casper.click('.demo-title');
	phantomcss.screenshot('.docs-title', 'Title');
});