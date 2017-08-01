"use strict";

angular.module("managerApp")
    .filter("momentFormat", function (moment) {
        return function (value, format) {
            return moment(value).format(format);
        };
    });
