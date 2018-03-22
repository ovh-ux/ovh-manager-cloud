angular.module("managerApp").component("cuiInlineAdder", {
    template: `
        <div class="cui-inline-adder">
            <ng-transclude></ng-transclude>
        </div>
    `,
    controller: "InlineAdderCtrl",
    controllerAs: "$ctrl",
    transclude: true,
    bindings: {
        onAdd: "&",
        onRemove: "&",
        uniqueProperty: "@"
    }
}).directive("cuiInlineAdderItem", () => ({
    replace: true,
    restrict: "E",
    templateUrl: "app/ui-components/inline-adder/inline-adder-item.html",
    controller: "InlineAdderItemCtrl",
    controllerAs: "$ctrlChild",
    transclude: true,
    require: {
        parent: "^cuiInlineAdder"
    },
    scope: true,
    bindToController: {
        item: "<",
        isNewItem: "<"
    }
}));
