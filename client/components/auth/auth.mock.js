"use strict";

angular.module("authMock", []);

angular.module("authMock").run(function (ssoAuthentication) {

    ssoAuthentication.setIsLoggedIn();

});
