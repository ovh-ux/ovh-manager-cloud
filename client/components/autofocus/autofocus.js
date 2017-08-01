angular.module("managerApp").directive('autofocus', function ($timeout) {
    "use strict";
    return {
        restrict: 'A',
        link: function ($scope, $element) {
            $timeout(function () {
                $element[0].focus();
            });
        }
    };
});
