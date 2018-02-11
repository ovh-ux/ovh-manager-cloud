angular.module("managerApp").component("ouiAddRemovePanel", {
    templateUrl: "app/ui-components/add-remove-panel/add-remove-panel.html",
    controller: "AddRemovePanelCtrl",
    controllerAs: "$ctrl",
    bindings: {
        sourceList: "<?",
        targetList: "<?",
        header: "@",
        sourceListHeader: "@",
        targetListHeader: "@",
        onAdd: "&",
        onRemove: "&",
        height: "<"
    }
});
