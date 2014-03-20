/*global define, window */
define(['fb/jquery'],



/**
 * window resize and scroll events
 * @exports fb/g-window-events
 * @requires  fb/jquery
 */
    function ($) {

    "use strict";




    // create a jQuery event bus
    var $eventBus = $({});
    var $window = $(window);

    var nrSubscribers   = {},
        fired           = {
            resize  : 0, // fire type index
            scroll  : 0, // fire type index
            last    : {} // for storing last fired index
        },
        timer           = {},
        windowInfo      = {},
        listening       = {},
        EVENT_INTERVAL  = 300;



    /* collects some data after resize or scroll
    * @returns {object}
    *   @returns {function} scroll
    *   @returns {function} resize
    */
    windowInfo = {

        scroll  : function () {
            return {
                scrollTop   : $window.scrollTop(),
                height      : $window.height()
            };
        },

        resize  : function () {
            return {
                orientation : window.orientation,
                width       : $window.width(),
                height      : $window.height()
            };
        }
    };


    // add one everytime fire is called by window listener
    // fired is watched in timer
    function fire(type) {
        fired[type]++;
    }

    // after a window event is triggered, every x ms watchFired is called by listen, until the window event stops
    function watchFired(type) {
        var throttleEvent = type + '.throttle';
        var debounceEvent = type + '.debounce';

        // wait for last activity
        if (fired[type] === fired.last[type]) {
            $eventBus.trigger(debounceEvent, [windowInfo[type]()]);

            fired[type] = 0;
            listening[type] = false;

        } else {
            // publish [type] event for throttle subscribers
            $eventBus.trigger(throttleEvent, [windowInfo[type]()]);

            // keep on listening
            listen(type, true);

        }

        fired.last[type] = fired[type];

    }

    /* watch fired object using timer, for better performance
    * @param {string} type of event (doesn't need to be validated again)
    * @param {boolean} on switch event off or on
    */
    function listen(type, on) {
        if (on) {
            listening[type] = true;
            timer[type] = setTimeout(function () {
                watchFired(type);

            }, EVENT_INTERVAL);

        } else if (timer[type]) {
            listening[type] = false;
            clearTimeout(timer[type]);

        }
    }

    // event handler called in setupEvent
    function handleWindowEvent(event) {
        var type = event.type;

        fire(type);

        if (!listening[type]) {
            listen(type, true);
        }
    }

    /* manage window event add or remove
    * @param {string} type of event
    * @param {boolean} on add or remove event
    */
    function setupEvent(type, on) {
        if (on) {
            $window.on(type, handleWindowEvent);

        } else {
            $window.off(type, handleWindowEvent);

            // stop listening
            listen(type, false);

        }
    }

    /*
    * subscribe to event type scroll/resize,
    * the first subscriber will setup the scroll event for
    * all next subscribers
    * @param {string} type of event 'scroll' or 'resize'
    * @param {function} callback function for publisher
    */
    function on(type, callback, timingType) {

        var subscriberType = type + '.' + timingType;

        // subscribe to type
        $eventBus.on(subscriberType, callback);

        // handle number of subscribers
        if (!nrSubscribers[type]) {
            nrSubscribers[type] = 0;
        }

        nrSubscribers[type] += 1;

        // prevent multiple window.on(type) setup
        if (nrSubscribers[type] === 1) {
            setupEvent(type, true, timingType);
        }

    }

    /* remove window event listener for callback
    * @param {string} type of event
    * @param {function} callback to no longer fire on event
    */
    function off(type, callback, timingType) {

        var nrSubs;
        var subscriberType = type + '.' + timingType;

        // unsubscribe for subscriberType with specific callback
        $eventBus.off(subscriberType, callback);

        // handle number of subscribers for window event type
        nrSubs = nrSubscribers[type] -= 1;

        nrSubscribers[type] = nrSubs < 0 ? 0 : nrSubs;

        // remove window[type] handler if no subscribers are left
        if (nrSubscribers[type] === 0) {
            setupEvent(type, false);
        }

    }

    /**
     * set up scroll listener
     * @param  {Function} callback   scroll callback
     * @param  {String}   [timingType=throttle] debounce || scroll
     * @return {Void}
     */
    function onScroll(callback, timingType) {
        on('scroll', callback, timingType || 'throttle');
    }

    /**
     * removes scroll listener
     * @param  {Function} callback function passed in on calling onScroll
     * @param  {String}   [timingType=throttle] debounce || scroll
     * @return {Void}
     */
    function offScroll(callback, timingType) {
        off('scroll', callback, timingType || 'throttle');
    }

    /**
     * add resize listerer
     * @param  {Function} callback   function
     * @param  {String}   [timingType=debounce] use the same timingType as subscribed to
     * @return {void}
     */
    function onResize(callback, timingType) {
        on('resize', callback, timingType || 'debounce');
    }

    /**
     * removes resize listener
     * @param  {Function} callback  function previously passed in onResize
     * @param  {String}   [timingType=debounce] use the same timingType as subscribed to
     * @return  {void}
     */
    function offResize(callback, timingType) {
        off('resize', callback, timingType || 'debounce');
    }

    // api
    return {
        onResize : onResize,
        offResize : offResize,

        onScroll : onScroll,
        offScroll : offScroll
    };

});
