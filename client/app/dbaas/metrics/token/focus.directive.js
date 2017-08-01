angular.module("managerApp")
    .directive("metricsFocusMe", function() {
        return {
            scope: {
                trigger: "=metricsFocusMe"
            },
            link: (scope, element) => {
                scope.$watch("trigger", (value) => {
                    if (value === true) {
                        element[0].focus();
                        scope.trigger = false;
                    }
                });
            }
        };
    });
