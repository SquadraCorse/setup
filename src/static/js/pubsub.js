/*!
* LOOSELY BASED ON: Pub/Sub implementation
* http://addyosmani.com/
* Licensed under the GPL http://jsfiddle.net/LxPrq/
*/
define(function () {

    "use strict";
    var topics = {},
    subUid = -1;

    /**
     * pubsub object, with methods
     * @exports v1/pubsub
     * @type {Object}
     */
    var pubsub = {

        /**
         * publishes topic
         * @param {string} topic with custom name
         * @param {*} args inject whatever is convenient to the subscribers in their callback functions
         * @ereturn {boolean|string} true or topic was subscribed to
         */
        publish : function (topic, args) {

            if (!topics[topic]) {
                return false;
            }

            setTimeout(function () {
                var subscribers = topics[topic],
                len = subscribers ? subscribers.length : 0;

                while (len--) {
                    subscribers[len].func(topic, args);
                }
            }, 0);

            return true;

        },

        /** subscribe to topic
         * @param {string} topic topic identifyer the subscriber wants to subscribe to
         * @param {function} func function to call when the topic is publised
         * @return {string} token that can be used for unsubscribing
         */
        subscribe : function (topic, func) {

            if (!topics[topic]) {
                topics[topic] = [];
            }

            var token = (++subUid).toString();

            topics[topic].push({
                token : token,
                func: func
            });

            return token;
        },

        /**
         * unsubscribe from topic
         * @param  {string} arg  use the topic AND your defined callback function, or just the token returned on subscribe
         * @param  {function} [func] function used to identify for unsubscribing, necessary when using the topic as first argument
         * @return false or the topic name
         */
        unsubscribe : function (arg, func) {
            var i, j;
            // decide arguments type: token or topic/fn
            var type = (function unsubArgs() {
                if (arg && func &&
                    typeof func === 'function') {
                    return 'topic_fn';
                } else if (typeof arg === 'string') {
                    return 'token';
                }
                return false;
            }());

            // unsubscribe with topic and function
            if (type === 'topic_fn') {
                if (topics[arg]) {
                    for (i = 0, j = topics[arg].length; i < j; i++) {
                        if (topics[arg][i].func === func) {
                            topics[arg].splice(i, 1);
                            return arg;
                        }
                    }
                }

            } else if (type === 'token') {
                // unsubscribe using returned token
                for (var m in topics) {if (topics[m]) {for (i = 0, j = topics[m].length; i < j; i++) {if (topics[m][i].token === arg) {topics[m].splice(i, 1); return arg; } } } }
            }

            return false;
        }

    };

    /**
     * pubsub singleton
     */
    return pubsub;

});
