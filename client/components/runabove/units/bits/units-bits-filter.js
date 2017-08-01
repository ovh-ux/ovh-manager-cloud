angular.module('managerApp').filter('RAUnitsBits', function () {
    "use strict";

    var tabUnits = ['B', 'KB', 'MB', 'GB', 'TB'];

    return function (size) {

        var rest = +size;
        var idx = 0;

        if (angular.isNumber(rest)) {

            while (((rest/1024) >= 1) && idx !== 4) {


                rest = rest / 1024;
                idx = idx + 1;
            }

            return Math.ceil(rest * 100)/100 + ' '  + tabUnits[idx];

        }

        return size;
    };
});
