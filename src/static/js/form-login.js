/* global define */
define(["fb/jquery"], function ($) {
    "use strict";

    var touchSupport = window.Modernizr ? window.Modernizr.touch : false;

    var attachToEvent = 'click';
    var attachToTouchEvent = 'touchstart mousedown';


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


    var Password = function (element) {

        var $element = $(element);
        var $toggle = $('<button type="button" class="fb-icon fb-input-password-switch">&#xe804</button>');
        var state = $element.attr('type');

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

        $element.on(clickEvent, onFocusInput);
        $element.on('keydown', onFocusInput);
        $toggle.on(clickEvent, toggleState);


        var changeInput = function (type) {
            $element.attr('type', type);
        };

        changeInput(state);

    };

    var init = function (options) {
        if (canSetInputAttribute) {
            new Password(options.container);
        }
    };

    return {
        init: init
    };

});
