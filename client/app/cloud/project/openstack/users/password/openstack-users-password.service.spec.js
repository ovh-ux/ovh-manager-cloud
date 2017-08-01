"use strict";

describe("Service : Users-password ", function () {

    //-----
    var passwordService;
    var projectId = "p1";
    var userId = "u1";
    var password = "t1";

    beforeEach(inject(function (_Password_) {
        passwordService = _Password_;
    }));

    describe("put, get and delete data", function () {
        xit("should put uniq data and get it", function () {
            passwordService.put(projectId, userId, password);

            var res = passwordService.get(projectId, userId);

            expect(res).toEqual(password);
        });

        xit("should put uniq data and delete it", function () {
            passwordService.put(projectId, userId, password);
            passwordService["delete"](projectId, userId);

            var res = passwordService.get(projectId, userId);

            expect(res).toEqual(undefined);
        });
    });

    describe("resist to strange case", function () {

        xit("should delete not pushed data", function () {
            passwordService["delete"](projectId, userId);

            var res = passwordService.get(projectId, userId);

            expect(res).toEqual(undefined);
        });

        xit("should return undefined for request inside not recognize projectId", function () {
            var res = passwordService.get(projectId, userId);
            expect(res).toEqual(undefined);
        });
    });
});
