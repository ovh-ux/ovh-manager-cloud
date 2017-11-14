"use strict";

angular.module("managerApp").service("Notification", ["$q", "ovhUserPref", function ($q, ovhUserPref) {
    "use strict";

    var self = this;

    self.stopNotification = function (userPrefName, subject) {
        var notificationArray = [];
        return ovhUserPref.getValue(userPrefName).then(function (data) {
            notificationArray = data;

            notificationArray.push(subject);
            return ovhUserPref.assign(userPrefName, notificationArray);
        })["catch"](function (error) {
            return error.status === 404 ? createNotificationUserPref(userPrefName, subject) : $q.reject(error);
        });
    };

    self.checkIfStopNotification = function (userPrefName, isArray, subject) {
        return ovhUserPref.getValue(userPrefName).then(function (notification) {
            return isArray ? _.indexOf(notification, subject) !== -1 : notification;
        })["catch"](function () {
            return false;
        });
    };

    function createNotificationUserPref(userPrefName, subject) {
        return ovhUserPref.create(userPrefName, [subject]);
    }
}]);
