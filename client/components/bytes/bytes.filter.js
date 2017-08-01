"use strict";

angular.module("managerApp").filter("bytes", function ($translate) {
    //TODO: Add this filter in UX components
    var units = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    var unitsKibi = ["B", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];

    function translateUnit (unit) {
        var key = "unit_size_" + unit;
        var translatedUnit = $translate.instant(key);
        // if translation is not found use the default unit
        return key === translatedUnit ? unit : translatedUnit;
    }

    var translatedUnits = _.map(units, translateUnit);
    var translatedUnitsKibi = _.map(unitsKibi, translateUnit);

    return function (bytes, precision, toKibi, fromUnit, toRawBytes) {
        if (fromUnit) {
            var fromKibiUnitIndex = _.indexOf(unitsKibi, fromUnit);
            var fromUnitIndex = _.indexOf(units, fromUnit);

            if (fromKibiUnitIndex !== -1) {
                if (fromKibiUnitIndex > 0) {
                    bytes = bytes * Math.pow(1024, fromKibiUnitIndex);
                }
            } else if (fromUnitIndex !== -1) {
                if (fromUnitIndex > 0) {
                    bytes = bytes * Math.pow(1000, fromUnitIndex);
                }
            } else {
                return "?";
            }
        }

        if (toRawBytes === true) {
            return bytes;
        }

        if (bytes === 0) {
            return "0";
        }
        if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) {
            return "?";
        }
        if (typeof precision === "undefined") {
            precision = 0;
        }
        var divider;
        var number;

        divider = toKibi ? 1024 : 1000;
        number = Math.floor(Math.log(bytes) / Math.log(divider));

        var value = (bytes / Math.pow(divider, Math.floor(number))).toFixed(precision);

        if (/\.0+$/.test(value)) {
            value = value.replace(/\.0+$/, "");
        }

        return value +  " " + (toKibi ? translatedUnitsKibi[number] : translatedUnits[number]);
    };
});
