angular.module("managerApp").directive('highlighedElement', function () {
    "use strict";
    return {
        restrict: 'A',
        link: function ($scope, $elem, $attrs) {

            var ids = [];

            $attrs.$observe('highlighedElement', function (_ids) {
                ids = _ids ? _ids.split(',') : [];
            });

            $scope.$on('highlighed-element.show', function (e, _ids) {
                if (!_ids || !ids.length) {
                    $elem.addClass('highlighed-element-active');
                } else {
                    _ids = _ids.split(',');
                    angular.forEach(_ids, function (item) {
                        if (~ids.indexOf(item.trim())) {
                            $elem.addClass('highlighed-element-active');
                        }
                    });
                }
            });

            $scope.$on('highlighed-element.hide', function (e, _ids) {
                if (!_ids || !ids.length) {
                    $elem.removeClass('highlighed-element-active');
                } else {
                    _ids = _ids.split(',');
                    angular.forEach(_ids, function (item) {
                        if (~ids.indexOf(item.trim())) {
                            $elem.removeClass('highlighed-element-active');
                        }
                    });
                }
            });
        }
    };
});
