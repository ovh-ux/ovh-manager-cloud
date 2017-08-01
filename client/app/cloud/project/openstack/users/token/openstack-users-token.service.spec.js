"use strict";

describe("Service : Users-token ", function () {

    // load the controller"s module
    beforeEach(module("managerAppMock"));

    //-----
    var tokenService;
    var projectId = "p1";
    var userId = "u1";
    var token = "t1";

    beforeEach(inject(function (_Token_) {
        tokenService = _Token_;
    }));

    describe("put, get and delete data", function () {
        xit("should put uniq data and get it", function () {
            tokenService.put(projectId, userId, token);

            var res = tokenService.get(projectId, userId);

            expect(res).toEqual(token);
        });

        xit("should put uniq data and delete it", function () {
            tokenService.put(projectId, userId, token);
            tokenService["delete"](projectId, userId);

            var res = tokenService.get(projectId, userId);

            expect(res).toEqual(undefined);
        });
    });

    describe("resist to strange case", function () {

        xit("should delete not pushed data", function () {
            tokenService["delete"](projectId, userId);

            var res = tokenService.get(projectId, userId);

            expect(res).toEqual(undefined);
        });

        xit("should return undefined for request inside not recognize projectId", function () {
            var res = tokenService.get(projectId, userId);
            expect(res).toEqual(undefined);
        });
    });
});
