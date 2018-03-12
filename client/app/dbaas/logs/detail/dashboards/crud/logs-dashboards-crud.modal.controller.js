class LogsDashboardsCrudModalCtrl {
    constructor ($scope, $state, $stateParams, ControllerHelper) {
        this.$scope = $scope;
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.ControllerHelper = ControllerHelper;
        this.isDuplicate = this.$stateParams.isDuplicate || false;
        this.dashboardName = this.$stateParams.dashboardName || null;
        this.openModal();
    }

    openModal () {
        this.ControllerHelper.modal.showModal({
            modalConfig: {
                templateUrl: "app/dbaas/logs/detail/dashboards/crud/logs-dashboards-crud.html",
                controller: "LogsDashboardsCrudCtrl",
                controllerAs: "ctrl",
                resolve: {
                    isDuplicate: this.isDuplicate,
                    dashboardName: this.dashboardName
                }
            }
        }).then(() => this.$scope.$parent.ctrl.initLoaders())
            .finally(() => this.onCloseModal());
    }

    onCloseModal () {
        this.$state.go("dbaas.logs.detail.dashboards");
    }
}

angular.module("managerApp").controller("LogsDashboardsCrudModalCtrl", LogsDashboardsCrudModalCtrl);
