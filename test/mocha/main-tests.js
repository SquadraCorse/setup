/* global require, mocha */
require(["../../src/static/path"], function () {

	"use strict";

	require.config({
		paths: {
			fb: "../../src/static/js",
			chai: "../../build/chai/chai"
		}
	});

	require([
		"chai"
	], function (chai) {
		chai.should();
		window.expect = chai.expect;
		mocha.setup("bdd");

		require([
			"specs.js"
		], function () {
			mocha.run();
		});
	});

});