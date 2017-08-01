angular.module("managerAppMock").factory("baseTestUtil", function ($rootScope) {
    "use strict";
    function TestUtil () {
        this.$scope = $rootScope;
    }

    return new TestUtil();

});
