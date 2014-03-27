/* global define */
define(["fb/jquery",
    "fb/i18n!fb/nls/generic",
    "fb/window-events"], function ($, I18n, Events) {
    "use strict";

    var touchSupport = window.Modernizr ? window.Modernizr.touch : false;

    var attachToEvent = 'click';
    var attachToTouchEvent = 'touchstart mousedown';
    var width = $(window).width();


    // Can we change attribute at all?
    var canSetInputAttribute = (function () {

        var body = document.body,
        input = document.createElement('input'),
        result = true;

        if (! body) {
            body = document.createElement('body');
        }
        input = body.appendChild(input);
        try {
            input.setAttribute('type', 'text');
        } catch (e) {
            result = false;
        }
        body.removeChild(input);
        return result;
    }());


    /**
     * Optionally toggle show password on password input
     * @param {string} element Container of type input
     */
    var Password = function (element) {

        // config
        var $element = $(element);
        var $toggle = $('<button type="button" class="fb-icon fb-input-password-switch">&#xe804</button>');
        var state = $element.attr('type');

        // Set correct html
        $element.wrap('<div class="fb-input-password-wrapper"></div>');
        $element.after($toggle);


        var onFocusInput = function () {
            $element.parent().addClass('js-fb-password-show');
        };


        var toggleState = function (event) {

            event.preventDefault();
            // event.stopPropagation();

            var state = $element.attr('type');

            switch (state) {
            case 'text':
                $toggle.removeClass('fb-toggled-text');
                changeInput('password');
                break;
            case 'password':
                $toggle.addClass('fb-toggled-text');
                changeInput('text');
                break;
            default:
                break;
            }

            $element.focus();

        };

        var clickEvent;
        if (touchSupport) {
            clickEvent = attachToTouchEvent;
        } else {
            clickEvent = attachToEvent;
        }

        // change attribute on element
        var changeInput = function (type) {
            $element.attr('type', type);
            var text;
            if (type === 'password') {
                text = I18n.show;
            } else {
                text = I18n.hide;
            }
            // Do this or set innerText instead of using icon
            $toggle.attr('title', text);
        };


        // On mobile we always start with showing password
        var startInput = function () {
            if (width < 481) {
                $toggle.addClass('fb-toggled-text');
                changeInput('text');
            } else {
                $toggle.removeClass('fb-toggled-text');
                changeInput('password');
            }
        };

        var _resizeFunction = function (e, arg) {
            // set correct window width we get from window events
            width = arg.width;
            // do we show password field on mobile or not
            startInput();
        };


        // Events
        $element.on(clickEvent, onFocusInput);
        $element.on('keydown', onFocusInput);
        $toggle.on(clickEvent, toggleState);

        Events.onResize(_resizeFunction);

        // Start our instance
        changeInput(state);
        startInput();

    };

    // PUBLIC API
    var init = function (options) {
        if (canSetInputAttribute) {
            new Password(options.container);
        }
    };

    return {
        init: init
    };

});
