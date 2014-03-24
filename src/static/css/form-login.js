/* global define */
define(["fb/jquery"], function ($) {
  "use strict";


  var init = function (options) {
      this.HideShowPassword(options.container)
  };

  return {
    init: init
  };


});
