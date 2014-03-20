/*global define, require */
define(['fb/jquery'],


    /**
     * central module to load and init components.
     * @exports fb/g-initcomponents
     * @requires fb/jquery
     */
    function ($) {

    "use strict";

    // future feature
    // currently not used!
    // function detectLevel() {
    //    level = 'mobile+';
    // }

    var Loader = function () {

        var instances = [];
        var callbackOnAllLoaded;
        var componentsToLoad = 0;

        function initComponent(data, $root) {

            componentsToLoad += 1;

            function handleLoaded(compfn) {
                var instanceAPI;
                if ($root) {
                    instanceAPI = compfn.init($root, data);
                    $.extend($root[0], instanceAPI);
                    instances.push(instanceAPI);

                } else {
                    instances.push(compfn.init(data));

                }

                var allLoaded = componentsToLoad === instances.length;

                if (allLoaded) {
                    if (callbackOnAllLoaded) {
                        callbackOnAllLoaded(instances);

                    }

                    instances = [];
                    callbackOnAllLoaded = null;

                }
            }

            // also check level in the future
            if (data.path) {
                require([data.path], handleLoaded);
            }
        }

        // read DOM element configuration
        function listenComponent($root) {
            var components = $root.data('components'),
                data,
                eventType;

            // it might not be json yet
            if (typeof components === 'string') {
                components = $.parseJSON($root.data('components'));
            }

            function setComponent() {
                eventType = data.initOn;
                // if not specified when to init, load immediately
                if (!eventType) {
                    initComponent(data, $root);
                    return;
                }

                $root.one(eventType, function () {
                    initComponent(data, $root);
                });

            }

            if (components) {
                $(components).each(
                    function () {
                        data = this;
                        setComponent();
                    }
                );
            } else {
                data = $root.data();
                setComponent();
            }
        }

        // handle DOM elements, with data attr config
        function listenDomElements(obj) {
            var i,
                $elems = obj.$context ? obj.$context.find('.' + obj.className) : $('.' + obj.className),
                len = $elems.length;

            // remove init className, they don't need to be initialized again
            $elems.removeClass(obj.className);

            for (i = 0; i < len; i += 1) {
                listenComponent($elems.eq(i));
            }
        }

        function initComponents(comps, callOnCompleted) {

            callbackOnAllLoaded = callOnCompleted;

            var len = comps.length,
                i;

            for (i = 0; i < len; i += 1) {
                // is dom element?
                if (comps[i].className) {
                    listenDomElements(comps[i]);
                } else {
                    initComponent(comps[i]);
                }
            }

        }

        return {
            initComponents: initComponents
        };

    };


    /**
     * loads and call the init method of found modules
     * @alias components
     * @param  {array} comps           array of module config objects
     * @param  {function} [callOnCompleted] callback function after the components are loaded and initialized
     *
     * @example
        &lt;div class=&quot;js-init&quot; data-path=&quot;v1/g-tabs&quot;&gt;&lt;/div&gt;

        &lt;script&gt;
            require(['fb/g-initcomponents'], function ($init) {
                $init.components([{
                    className : &quot;js-init&quot;
                }], onComplete)
            });
        &lt;/script&gt;
     *
     * @return {void}
     */
    function init(comps, callOnCompleted) {
        var loader = new Loader();
        loader.initComponents(comps, callOnCompleted);
    }

    return {
        components  : init
    };

});

