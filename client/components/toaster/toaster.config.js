"use strict";

angular.module("managerApp").config(function (ToastProvider) {

    ToastProvider.setExtraClasses("messenger-fixed messenger-on-bottom messenger-on-right");
    ToastProvider.setTheme("air");

});
