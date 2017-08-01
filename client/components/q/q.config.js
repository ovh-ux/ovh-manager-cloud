angular.module("managerApp").config(["$qProvider", function ($qProvider) {
    "use strict";
    $qProvider.errorOnUnhandledRejections(false);
}]);
