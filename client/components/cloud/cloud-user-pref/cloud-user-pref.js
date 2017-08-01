"use strict";
angular.module("managerApp").service("CloudUserPref",
    function ($q, ovhUserPref) {

        this.get = function (key) {
            if (_.isString(key)) {
                return ovhUserPref.getValue(key.toUpperCase()).then(function (data) {
                    return $q.when(data || {});
                }, function () {
                    return {};
                });
            } else {
                return $q.reject("UserPref key must be of type String");
            }
        };

        this.set = function (key, value) {
            // We do it asynchronously and assume everything is ok.
            if (_.isString(key)) {
                return ovhUserPref.assign(key.toUpperCase(), value || {}).then(function () {
                    return $q.when(value);
                });
            } else {
                return $q.reject("UserPref key must be of type String");
            }
        };
    }
);
