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

    var i18n = {
        'password': 'toon',
        'text': 'verberg'
    };

    var Password = function (element) {
        var $element = $(element);
        var $toggle = $('<button type="button" class="fb-input-password-switch"></button>');
        var state = $element.attr('type');

        $element.wrap('<div class="fb-input-password-wrapper"></div>');
        $element.after($toggle);



        var onFocusInput = function () {
            $element.parent().addClass('js-fb-password-show');
        };
        var onBlurInput = function () {
            $element.parent().removeClass('js-fb-password-show');
        };

        var toggleState = function (e) {
            e.preventDefault();
            e.stopPropagation();

            var state = $element.attr('type');

            switch (state) {
            case 'text':
                changeInput('password');
                break;
            case 'password':
                changeInput('text');
                break;
            default:
                break;
            }

            return false;
        };

        var e;
        if (touchSupport) {
            e = attachToTouchEvent;
        } else {
            e = attachToEvent;
        }

        $element.on(e, onFocusInput);
        $element.on('blur', onBlurInput);

        $toggle.on(e, toggleState);

        var changeInput = function (type) {
            $element.attr('type', type);
            $toggle.text(i18n[type]);
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
