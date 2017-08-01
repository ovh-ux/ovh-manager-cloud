"use strict";

describe("Component: elementWithWriteRightRequired", function () {

    var util;

    beforeEach(module("managerAppMock"));

    beforeEach(inject(function (directiveTestUtil) {
        util = directiveTestUtil;
    }));

    var templates = {
        "elementWithWriteRightRequired": {
            element: '<button id="elementUnderTest" write-right-required>My button</button>'
        },
        "elementWithNgIfTrue": {
            element: $('<button id="elementUnderTest" ng-if="true" write-right-required>My button</button>').prependTo("body")
        }
    };

    describe("directive behavior", function () {

        it("should hide element when user don't have write right", inject(function ($q, CloudProjectRightService) {

            spyOn(CloudProjectRightService, "userHaveReadWriteRights").and
                .returnValue($q.when(false));

            var element = util.compileDirective(templates.elementWithWriteRightRequired);

            expect(element.hasClass("hide")).toEqual(true);

        }));

        it("should not hide element when user have write right", inject(function ($q, CloudProjectRightService) {

            spyOn(CloudProjectRightService, "userHaveReadWriteRights").and
                .returnValue($q.when(true));

            var element = util.compileDirective(templates.elementWithWriteRightRequired);

            expect(element.hasClass("hide")).toEqual(false);

        }));

        it("should overwrite conflicts with ng-if and hide element even if ng-if === true", inject(function ($q, CloudProjectRightService) {

            spyOn(CloudProjectRightService, "userHaveReadWriteRights").and
                .returnValue($q.when(false));

            util.compileDirective(templates.elementWithNgIfTrue);

            expect($("#elementUnderTest").hasClass("hide")).toEqual(true);

        }));

    });
});
