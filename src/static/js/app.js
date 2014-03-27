require(["fb/img-responsive", "fb/initcomponents"], function ($Image, $init) {
	"use strict";

	/**
	 * MAIN FB APPLICATION
	 */
	

	// CLASS 'js-fb-img' IS FOR RESPONSIVE IMAGES ONLY
	// WE ALWAYS HAVE IMAGES ON OUR PAGE
	$Image.init({ threshold: 300 });


	// CLASS 'js-fb-init' IS FOR INIT COMPONENTS ONLY
	// THESE MODULES ARE DEFINED IN OUR HTML
	$init.components([{className : "js-fb-init"}]);


});

