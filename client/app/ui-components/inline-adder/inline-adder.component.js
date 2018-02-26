angular.module("managerApp").component("cuiInlineAdder", {
    template: `
        <div class="cui-inline-adder">
            <cui-inline-adder-item  data-ng-repeat="item in $ctrl.inlineItems"
                item="item"
                newItem="false"
                property="data.allowedNetworks"></cui-inline-adder-item>
            <cui-inline-adder-item newItem="true" property="data.allowedNetworks"></cui-inline-adder-item>
        </div>
    `,
    controller: "InlineAdderCtrl",
    controllerAs: "$ctrl",
    transclude: false,
    bindings: {
        inlineItems: "<?",
        onAdd: "&",
        onRemove: "&",
        property: "@"
    }
}).directive("cuiInlineAdderItem", () => ({
    replace: true,
    restrict: "E",
    template: `
        <div class="cui-inline-adder__item">
            <div class="cui-inline-adder__item_content">
                <ng-transclude></ng-transclude>
            </div>
            <div class="cui-inline-adder__item_actions">
                <button type="button" class=""
                    data-ng-click="$ctrl.add()">
                        <i class="oui-icon oui-icon-add" aria-hidden="true"></i>
                </button>
            </div>
        </div>
    `,
    controller: "InlineAdderItemCtrl",
    controllerAs: "$ctrl",
    transclude: true,
    require: {
        parent: "^cuiInlineAdder"
    },
    bindings: {
        item: "<?",
        newItem: "<",
        property: "@"
    }
}));
