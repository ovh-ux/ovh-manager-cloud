"use strict";

angular.module("managerApp").controller("DBaasTsProjectAddCtrl",
    function (User, DBaasTsConstants) {
        var self = this;

        User.Lexi().get().$promise.then(function (me) {
            var lang = me.ovhSubsidiary;
            var order = DBaasTsConstants.urls.order;

            self.orderUrl = order[lang] || order.FR;
        });
    });
