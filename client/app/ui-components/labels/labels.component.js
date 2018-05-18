angular.module("managerApp")
    .component("cuiLabels", {
        template: `
            <div class="labels">
                <span class="labels__summary" data-ng-repeat="item in $ctrl.items track by $index" data-ng-if="$index < 2">
                    <cui-labels-item data-item="item">
                        <span data-ng-transclude></span>
                    </cui-labels-item>
                </span>
                <oui-dropdown align="end" arrow data-ng-if="$ctrl.items.length > 2">
                    <span class="labels__container labels__container-button" oui-dropdown-trigger>
                        <span class="labels__summary labels__button">+{{ $ctrl.items.length - 2 }}</span>
                    </span>
                    <oui-dropdown-content class="labels__container labels__container-flex">
                        <span class="labels__summary" data-ng-repeat="item in $ctrl.items track by $index" data-ng-if="$index >= 2">
                            <cui-labels-item data-item="item">
                                <span data-ng-transclude></span>
                            </cui-labels-item>
                        </span>
                    </oui-dropdown-content>
                 </oui-dropdown>
            </div>
        `,
        controller: class {},
        controllerAs: "$ctrl",
        transclude: true,
        bindings: {
            items: "<"
        }
    })
    .directive("cuiLabelsItem", () => ({
        template: `
            <span data-ng-cloak data-ng-transclude></span>
        `,
        transclude: true,
        restrict: "E",
        scope: true,
        controllerAs: "$ctrl",
        replace: true,
        compile: (element, attr, linker) => ($scope, $element) => {
            $scope.$watch(() => $scope.$ctrl.item, item => {
                const childScope = $scope.$new();

                // We inject a $item property in the scope to allow user to choose how to display each item in the component.
                // Use like this => <cui-labels data-items="$row.farmId">{{ $item.displayName || $item.farmId }}</cui-labels>
                childScope.$item = item;
                linker(childScope, clone => {
                    $element.empty();
                    $element.append(clone);
                    const block = {};
                    block.el = clone;
                    block.scope = childScope;
                });
            });
        },
        controller: class {},
        bindToController: {
            item: "<"
        }
    }));

