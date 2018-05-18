angular.module("managerApp").component("cuiDualList", {
    templateUrl: "app/ui-components/dual-list/dual-list.html",
    controller: "DualListCtrl",
    controllerAs: "$ctrl",
    bindings: {
        sourceListLabel: "@",
        targetListLabel: "@",
        moveAllLabel: "@",
        removeAllLabel: "@",
        sourceListEmptyLabel: "@",
        targetListEmptyLabel: "@",
        addLabel: "@",
        property: "@",
        height: "@",
        sourceList: "<?",
        targetList: "<?",
        onAdd: "&",
        onRemove: "&",
        bulkActionEnabled: "<"
    }
});
