angular.module("managerAppMock").factory("directiveTestUtil", function ($compile, baseTestUtil) {
    "use strict";
    var testUtil = Object.create(baseTestUtil);

    testUtil.compileDirective = function (template, scope) {
        angular.extend(this.$scope, angular.copy(scope));
        var element = $compile(template.element)(this.$scope);
        this.$scope.$digest();
        return element;
    };

    return testUtil;

});
