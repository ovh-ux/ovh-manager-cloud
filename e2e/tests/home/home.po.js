/**
 * This file uses the Page Object pattern to define the home page for tests
 * https://docs.google.com/presentation/d/1B6manhG0zEXkC-H-tPo2vwU06JhL8w9-XCF9oehXzAQ
 */

"use strict";

var HomePage = function () {
    this.homeEl = element(by.id("home"));
    this.h1El = this.homeEl.element(by.css("h1"));
};

module.exports = new HomePage();

