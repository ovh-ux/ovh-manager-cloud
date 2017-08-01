"use strict";

angular.module("managerApp")
    .component("snapshotList", {
        templateUrl: "components/cloud/project/billing/snapshot-list/billing-snapshot-list.component.html",
        controller: "BillingSnapshotListComponentCtrl",
        bindings: {
            snapshots: "<"
        },
        translations: ["common", "cloud/project/billing/component/snapshot-list"]
    });
