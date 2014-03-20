/*global test, require, mocha, describe, start, equal, ok, expect, asyncTest, module */

/* global define, describe, it, expect */
define(function (require) {
    "use strict";

    // OUR MODULE
    var pubsub = require("fb/pubsub");


    var state = {},
        fn1 = function (topic, string) {
            state.fn1 = string;
        },
        fn2 = function (topic, string) {
            state.fn2 = string;
        },
        fnObj = function (topic, data) {
            state.fnObj = data;
        },
        fnFn = function (topic, fn) {
            state.fnFn = fn;
        },
        fnToken = function (topic, str) {
            state.fnToken = 'tokenized: ' + str;
        };

    var subscr = pubsub.subscribe("change1", fn1),
    subscr2 = pubsub.subscribe("change1", fn2),
    subscrObj = pubsub.subscribe("changeObj", fnObj),
    subscrFn = pubsub.subscribe("changeFn", fnFn),
    token = pubsub.subscribe("change1", fnToken);

    // test function that will be published
    function testFn() {
        return true;
    }

    /* ********************************
    * pubsub tests
    * ******************************** */

    describe("pubsub: subscribe", function () {

        pubsub.publish("change1", "show change1");
        pubsub.publish("changeObj", {a : 10, b : {c : "foo"}});
        pubsub.publish("changeFn", testFn);

        describe("published change1", function () {

            it("published argument should be a string", function () {
                expect(typeof state.fnToken).to.be.a('string');
            });

            it("also for subscriber fn1", function () {
                expect(state.fn1).to.equal("show change1");
            });

            it("and subscriber fn2", function () {
                expect(state.fn2).to.equal("show change1");
            });

            it("and subscriber fnToken", function () {
                expect(typeof state.fnToken).to.be.a('string');
                expect(state.fnToken).to.equal("tokenized: show change1");
            });

        });

        describe("published changeObj", function () {
            it("it should be an object", function () {
                expect(typeof state.fnObj).to.equal('object');
            });

            it("and have property obj.b.c with value 'foo'", function () {
                expect(state.fnObj.b.c).to.equal("foo");
            });

        });

        describe("published changeFn", function () {
            it("it should be a function", function () {
                expect(typeof state.fnFn).to.equal("function");
            });

            it("and the returned function should return true", function () {
                var res = state.fnFn();
                expect(res).to.equal(true);
            });

        });

    });


    var unsubscribe = function () {
        setTimeout(function () {
            pubsub.unsubscribe('change1', fn1);
            pubsub.unsubscribe(token);
            pubsub.publish("change1", "show change2");
        }, 10);
    };

    describe("pubsub: unsubscribe", function () {

        // delayed unsubscribe
        unsubscribe();

        describe("after new publish", function () {

            // delay first one, rest will follow after this one
            // so timing will stay ok
            it("should not affect state.fn1", function (done) {
                setTimeout(function () {
                    expect(state.fn1).to.equal("show change1");
                    done();
                }, 20);
            });

            it("still changes fn2 (still subscribed)", function () {
                expect(state.fn2).to.equal("show change2");
            });

            it("and doesn't change state.fnToken", function () {
                expect(state.fnToken).to.equal("tokenized: show change1");
            });


        });

    });



});

