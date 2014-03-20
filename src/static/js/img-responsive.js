/*global define */
define([
    "fb/jquery",
    "fb/img-responsive/img-srcset",
    "fb/window-events"
],

    /**
     * Module responsive images
     * @description When css class and attributes are set correctly using this module will result in responsive images based on their srcset.<br />
     * @exports fb/img-responsive
     * @requires fb/jquery
     * @requires fb/window-events


define(["fb/img-responsive"], function(Responsive) {
    "use strict";
    Responsive.crawl();
});

    */

function ($, Responsive, Events) {

    "use strict";

    /**
     * jQuery cached instance of window since we do stuff on resize and scroll
     * @type {object}
     */
    var $window = $(window);

    /**
     * Collection of lazy images
     * @type {Array}
     */
    var images = [];
    /**
     * Standard pixels from viewport do we start loading lazy image
     * @type {Number}
     */
    var treshold = 100;
    /**
     * We set some listeners only once for this module
     * @type {Boolean}
     */
    var listen = false;
    /**
     * Background-image url pattern
     * @type {RegExp}
     */
    var pattern = /url\(|\)|"|'/g;
    /**
     * Do we have native srcset support
     * @type {Function}
     */
    var srcsetImplemented = function () {
        var img = new Image();
        return 'srcset' in img;
    };
    var hasSrcset = srcsetImplemented();


    /**
     * Lazy load, check if image from images collection is in client view
     * @function
     */
    var _lazy = function (a, b) {

        // NO MORE IMAGES LEFT TO DO
        if (images.length === 0) { return; }

        // CURRENT POSITION
        var top;
        var height;

        // DO WE GET PARAMS FROM WINDOW-EVENTS?
        if (!b) {
            top = $window.scrollTop();
            height = $window.height();
        } else {
            top = b.scrollTop;
            height = b.height;
        }

        /**
         * Which of all possible lazy comtainers are in client view?
         */
        var inview = $.grep(images, function (image) {

            var $image = $(image);

            // COORDINATESs
            var wt = parseInt(top, 10),                         // WINDOW TOP
            wb = wt + parseInt(height, 10),                     // WINDOW BOTTOM
            it = parseInt($image.offset().top, 10),             // IMAGE TOP POSITION
            ib = it + parseInt($image.parent().height(), 10);   // IMAGE BOTTOM (EQ IT + OUR RATIO HEIGHT)

            return ib >= wt - treshold && it <= wb + treshold;

        });

        /**
         * Trigger lazy load containers which are in view
         */
        if (inview.length > 0) {

            // TRIGGER IMAGE TO LAZY LOAD
            var j = inview.length;
            while (j--) {
                $(inview[j]).addClass('fb-img-loading').trigger("fb.img.lazy");
            }


        }

    };


    /**
     * Change url of image resource according to srcset condition
     */
    var _changeUrl = function () {

        var $self = $(this);

        var $img;
        var srcset;
        var url;
        var background = false;
        var type = $self.attr('data-img-type') || 'replace';

        switch (type) {
        case 'background':
            var bg = $self.css('background-image');
            srcset = $self.attr('data-srcset');
            url = bg.replace(pattern, "");
            background = true;
            break;
        case 'native':
            $img = $self;
            srcset = $self.attr('srcset');
            url = $img.attr('src');
            break;
        default:
            // LAZY AND NOT LAZY ONES
            $img = $self.find('.fb-img-replace-me');
            srcset = $self.attr('data-srcset');
            url = $img.attr('src');
            break;
        }


        var srcsetInfo = new Responsive.get({
            srcset: srcset,
            width: $self.innerWidth()
        });

        // IF IMAGE IS THE SAME AS PREVIOUS DON'T PROCEED
        if (url === srcsetInfo.best.src) { return; }

        // REPLACE IMAGE
        if (background) {
            $self.css('background-image', 'url(' + srcsetInfo.best.src + ')');
        } else {
            if ($img.length !== 0) {
                $img.attr('src', srcsetInfo.best.src);
            }
        }

    };


    /**
     * On window resize we parse through our replaced images list
     */
    var _resizeFunction = function (a, b) {

        // RESET VIEW SETTINGS SRCSET
        Responsive.setView(b);

        // PROCEED WITH PARSED CONTAINERS/IMAGES
        $('.fb-img-done').each(_changeUrl);


        // MAYBE AFTER RESIZE NEW LAZY CONTAINER CAME INTO VIEW?
        _lazy();

    };







    /**
     * Replace image
     * @param  {object} containerEl Reference to container with srcset
     */
    var _replace = function (containerEl) {

        var $self = $(containerEl);
        var srcset = $self.attr('data-srcset');
        var srcsetInfo = new Responsive.get({ srcset: srcset });


        if (srcsetInfo && srcsetInfo.best && srcsetInfo.best.src) {

            var img = '<img src="' + srcsetInfo.best.src + '" class="fb-img-replace-me"/>';
            var $img = $(img);
            // PREVENT BROWSER FROM PAINTING BACKGROUND IMAGE
            $img.one("load", function () {
                $self.removeClass('fb-img-loading');
            });
            // APPEND IMAGE TO DOM
            $self.empty().append(img);


        } else {
            $self.removeClass('fb-img-loading fb-img-done');
        }

    };

    /**
     * Replace background image
     * @param  {object} obj Reference to container with srcset
     */
    var _backgroundReplace = function (obj) {

        var $self = $(obj);
        var srcset = $self.attr('data-srcset');
        var srcsetInfo = new Responsive.get({ srcset: srcset });

        if (srcsetInfo && srcsetInfo.best && srcsetInfo.best.src) {

            // SET BACKGROUND IMAGE
            $self.css('background-image', 'url(' + srcsetInfo.best.src + ')');

        } else {
            $self.removeClass('fb-img-done');
        }

    };

    /**
     * Lazy Replace image
     * @param  {object} obj Reference to container with srcset
     */
    var _lazyReplace = function (obj) {

        var $self = $(obj);

        /**
         * Store this lazy load container, so when scrolling we can loop through this set. Faster.
         */
        images.push(obj);

        /**
         * When lazy load image comes in view make sure we append an image accordingly once
         */
        $self.one("fb.img.lazy", function () {

            var srcsetInfo = new Responsive.get({
                srcset: $self.attr('data-srcset'),
                width: $self.innerWidth()
            });


            if (srcsetInfo && srcsetInfo.best && srcsetInfo.best.src) {

                var img = '<img src="' + srcsetInfo.best.src + '" class="fb-img-replace-me"/>';
                var $img = $(img);
                // PREVENT BROWSER FROM PAINTING BACKGROUND IMAGE
                $img.one("load", function () {
                    $self.removeClass('fb-img-loading');
                });
                // APPEND IMAGE TO DOM
                $self.empty().append(img);

                var item = $.inArray(obj, images);
                if (item !== -1) {
                    images.splice(item, 1);
                }

            } else {
                $self.removeClass('fb-img-loading fb-img-done');
            }

        });
    };


    /**
     * When image is set using normal srcset but browser doesn't supprt srcset
     * @param  {object} obj Image itself
     */
    var _nativeReplace = function (obj) {

        var $self = $(obj);

        if (!$self.replaced) {

            $self.replaced = true;

            var srcsetInfo = new Responsive.get({
                src: $self.attr('src'),
                srcset: $self.attr('srcset')
            });

            if (srcsetInfo && srcsetInfo.best && srcsetInfo.best.src) {

                if ($self.attr('src') === srcsetInfo.best.src) {

                    return;

                } else {

                    $self.attr('src', srcsetInfo.best.src);

                }

            } else {

                $self.removeClass('fb-img-loading fb-img-done');

            }

            $self = null;

        }
    };


    /**
     * Process each image what is given to us
     */
    var _process = function () {

        var $self = $(this);
        var type = $self.attr('data-img-type') || 'replace';

        switch (type) {
        case 'replace':
            $self.addClass('fb-img-loading fb-img-done');
            _replace(this);
            break;
        case 'lazy':
            if (!$self.is(":hidden")) { // ONLY ONCE WHICH ARE VISIBLE
                $self.addClass('fb-img-done');
                _lazyReplace(this);
            }
            break;
        case 'background':
            $self.addClass('fb-img-done');
            _backgroundReplace(this);
            break;
        case 'native':
            if (hasSrcset) { return; }
            $self.addClass('fb-img-done');
            _nativeReplace(this);
            break;
        }

    };



    /**
     * Public API freak implementation initcomponents or footer loading, 
     * @function
     */
    var init = function (options) {

        var selector = ".js-fb-img:not('.fb-img-done')";
        var $collection = (options && options.container) ? $(options.container).andSelf().find(selector) : $(selector);


        /**
         * LOOP THROUGH IMAGE COLLECTION AND PROCESS EACH TYPE
         * @function
         */
        $collection.each(_process);


        /**
         * Set window events only ONCE!
         */
        if (!listen) {

            listen = true;
            Events.onScroll(_lazy);
            Events.onResize(_resizeFunction);

        }

        /**
         * On initialize look for containers in view
         */
        _lazy();

    };


    /**
     * Public API, loop though our images by class 'js-fb-img' which are not processed before
     * @param {object} [options] Some configuration settings
     * @param {string} [options.container] Container holding the images to be handled by this module
     */
    var crawl = function (options) {
        // MAYBE IN FUTURE DO SOMETHING ELSE WITH STATE OR PASSED CONTAINER/CONTEXT...
        init(options);
    };


    return {
        init: init,
        crawl: crawl
    };

});
