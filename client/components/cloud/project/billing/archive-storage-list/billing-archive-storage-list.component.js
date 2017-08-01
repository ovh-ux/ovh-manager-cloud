"use strict";

angular.module("managerApp")
    .component("archiveStorageList", {
        templateUrl: "components/cloud/project/billing/archive-storage-list/billing-archive-storage-list.component.html",
        controller: "BillingArchiveStorageListComponentCtrl",
        bindings: {
            storages: "<"
        }
    });
