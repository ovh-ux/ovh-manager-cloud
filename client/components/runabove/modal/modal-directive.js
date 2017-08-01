angular.module('managerApp').directive('raModal',
[function () {
    "use strict";

    return {
        'restrict'    : 'A',
        'scope'       : false,
        'transclude'  : true,
        'controller'  : 'RA.modalCtrl',
        'replace'     : true,
        'templateUrl' : 'components/modal/modal.html',
        'link'  : function ($scope, $element, $attrs, ctrl) {
            var modal;

            ctrl.show = function () {
                if (!modal) {
                    modal = $('#currentAction').modal({
                        'backdrop': 'static'
                    });
                } else {
                    modal.modal('show');
                }
            };

            ctrl.hide = function () {
                if (modal) {
                    modal.modal('hide');
                }
            };
        }
    };

}]);
