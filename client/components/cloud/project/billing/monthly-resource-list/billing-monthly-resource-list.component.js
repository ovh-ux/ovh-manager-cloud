"use strict";

angular.module("managerApp")
    .component("monthlyResourceList", {
        templateUrl: "components/cloud/project/billing/monthly-resource-list/billing-monthly-resource-list.component.html",
        controller: "BillingMonthlyResourceListComponentCtrl",
        bindings: {
            resources: "<"
        }
    });
