angular.module("managerApp").directive('clickEnterOnKeypress', function ($parse) {
    "use strict";
    return  {
        restrict: 'A',
        link    : function ($scope, $element, $attrs) {

            $element.on('keyup', function (e) {
                if (e && (e.keyCode === 13 || e.keyCode === 32) && $attrs.ngClick) {
                    $parse($attrs.ngClick)($scope);
                    $scope.$apply();
                }
            });
        }
    };
});
