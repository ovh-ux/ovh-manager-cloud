angular.module("managerApp")
    .directive("cuiCompareTo", () => ({
        restrict: "A",
        require: "ngModel",
        scope: {
            otherModelValue: "=cuiCompareTo"
        },
        link: (scope, element, attributes, ngModel) => {
            ngModel.$validators.compareTo = function (modelValue) {
                return modelValue === scope.otherModelValue;
            };
            scope.$watch("otherModelValue", () => {
                ngModel.$validate();
            });
        }
    }));
