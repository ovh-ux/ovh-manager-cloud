"use strict";

var config = browser.params;

describe("Home View", function () {
    var page;

    beforeEach(function () {
        browser.get(config.baseUrl + "/");
        page = require("./home.po");
    });

    it("should do a dummy test", function () {
        // browser.pause(5860);
        expect(page.h1El.isPresent()).toBe(true);
    });
});
