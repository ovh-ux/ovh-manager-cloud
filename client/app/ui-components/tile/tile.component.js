(() => {
    angular.module("managerApp")
        .component("cuiTile", {
            templateUrl: "app/ui-components/tile/tile.html",
            transclude: true,
            bindings: {
                title: "<",
                loading: "<"
            }
        });
})();
