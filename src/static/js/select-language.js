define(["fb/jquery"], function ($) {
	"use strict";


	var _generate = function () {
		$('.docs-intro').append('bar... ');
	};


	var _startApp = function (event) {
		event.preventDefault();
		_generate();
	};


	var init = function ($el, context) {

		$('.docs-intro').append('foo...' + context.lang + ' ');

		// next time when it is clicked
		$el.on('click', _startApp);

		// Do show main UX when API is kickstarted (init on click initcomponents)
		_generate();

	};


	return {
		init: init
	};


});
