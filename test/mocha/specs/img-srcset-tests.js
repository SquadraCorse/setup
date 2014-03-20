/* global define, describe, it, expect */
define(function (require) {
    "use strict";


    // OUR MODULE
    var Srcset = require("fb/img-responsive/img-srcset");

    // OUR SETUP
    var srcset = '//img.static-afkl.com/app/sa/991-s.jpg 480w, //img.static-afkl.com/app/sa/991-m.jpg 768w, //img.static-afkl.com/app/sa/991-l.jpg 1x';
    var single = '//img.static-afkl.com/app/sa/991-s.jpg';

    var options = {};
    options.src = null;
    options.srcset = srcset;
    options.width = 500;

    var state = {},
        img1 = function () {
            state.img1 = Srcset.get(options);
        },
        img2 = function () {
            options.width = 300;
            state.img2 = Srcset.get(options);
        },
        img3 = function () {
            var obj = {
                width: '200px',
                height: '200px'
            };
            options.width = '';
            Srcset.setView(obj);
            state.img3 = Srcset.get(options);
        },
        img4 = function () {
            options.width = 800;
            options.srcset = single;
            state.img4 = Srcset.get(options);
        },
        best1 = function () {
            options.width = 800;
            options.srcset = srcset;
            options.src = '//img.static-afkl.com/app/sa/991-s.jpg';
            state.best1 = Srcset.get(options);
        },
        best2 = function () {
            options.width = 1000;
            options.srcset = srcset;
            options.src = '';
            state.best2 = Srcset.image(state.best1.candidates, options.width);
        };

    // RUN TESTS
    img1();
    img2();
    img3();
    img4();

    best1();
    best2();

    // SHOW TEST RESULTS
    describe("img-srcset: GET API", function () {

        describe("Get srcset data (best and candidates)", function () {

            it("Result 768 image", function () {
                expect(state.img1.best.src).to.equal("//img.static-afkl.com/app/sa/991-m.jpg");
                expect(state.img1.best.w).to.equal(768);
            });

            it("Result 480 image", function () {
                expect(state.img2.best.src).to.equal("//img.static-afkl.com/app/sa/991-s.jpg");
                expect(state.img2.best.w).to.equal(480);
            });

            it("Result when window width is set to 200px square, no container width", function () {
                expect(state.img3.best.src).to.equal("//img.static-afkl.com/app/sa/991-s.jpg");
                expect(state.img3.best.w).to.equal(480);
            });

            it("Result when only one image is given without w/h/x", function () {
                expect(state.img4.best.src).to.equal("//img.static-afkl.com/app/sa/991-s.jpg");
                expect(state.img4.best.w).to.equal(Infinity);
            });

            it("Get srcset data (will use it in IMG API)", function () {
                expect(state.best1.best.src).to.equal("//img.static-afkl.com/app/sa/991-l.jpg");
            });

            it("Srcset length", function () {
                expect(state.best1.candidates.length).to.equal(3);
            });

        });

    });

    describe("img-srcset: IMAGE API", function () {

        describe("Get best image from candidates", function () {

            it("Result best image src", function () {
                expect(state.best2.src).to.equal("//img.static-afkl.com/app/sa/991-l.jpg");
            });

            it("Result best image info", function () {
                expect(state.best2.w).to.equal(Infinity);
                expect(state.best2.h).to.equal(Infinity);
                expect(state.best2.x).to.equal(1);
            });

        });


    });







});