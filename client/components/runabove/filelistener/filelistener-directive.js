angular.module('managerApp').directive('filelistener', function() {
    "use strict";

    return {
        restrict: 'E',
        template: '<input type="file" />',
        replace: true,
        require: 'ngModel',
        link: function(scope, element, attr, ctrl) {
            var listener = function() {
                scope.$apply(function() {
                    ctrl.$setViewValue(null);
                });
                scope.$apply(function() {
                    if (attr.multiple) {
                        ctrl.$setViewValue(element[0].files);
                    } else {
                        ctrl.$setViewValue(element[0].files[0]);
                    }
                });
            };
            element.bind('change', listener);
        }
    };
});
