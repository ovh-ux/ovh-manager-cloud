(() => {
    class CloudProjectComputeInfrastructureListCtrl {
        constructor ($scope) {
            this.$scope = $scope;
        }

        $onInit () {
            this.loaders = {
                init: false
            };
        }
    }

    angular.module("managerApp").controller("CloudProjectComputeInfrastructureListCtrl", CloudProjectComputeInfrastructureListCtrl);
})();
