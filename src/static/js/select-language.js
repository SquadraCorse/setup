define(["fb/jquery"], function ($) {
	"use strict";

	var foo = function (e) {
		e.preventDefault();
		$('.docs-intro').append('bar... ');
	};

	var init = function ($el, context) {

		$('.docs-intro').append('foo...' + context.lang + ' ');

		// next time when it is clicked
		$el.on('click', foo);

		foo();
	};

	return {
		init: init
	};

});
