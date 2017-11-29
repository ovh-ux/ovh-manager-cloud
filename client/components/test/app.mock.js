"use strict";

angular.module("managerAppMock", [
    "managerApp",
    "authMock",
    "translateMock"
]);

angular.module("managerAppMock").run(function ($httpBackend) {

    /*----------  MISC MOCKS  ----------*/
    $httpBackend.whenGET("/bower_components/angular-i18n/angular-locale_en-us.js").respond(200, "");

    /*----------  APIV6 MOCKS  ----------*/
    $httpBackend.whenGET(/api(?:v6)?\/me$/).respond(200, {});
    $httpBackend.whenGET(/api(?:v6)?\/status\/task/).respond(200, {});

    /*----------  2API MOCKS  ----------*/
    $httpBackend.whenGET(/2api\/me\/alerts/).respond(200, []);
    $httpBackend.whenGET(/2api\/products/).respond(200, {});
});

