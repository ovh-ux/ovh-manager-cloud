class LogsTokenAddModalCtrl {
    constructor ($scope, $state, ControllerHelper) {
        this.$scope = $scope;
        this.$state = $state;
        this.ControllerHelper = ControllerHelper;
        this.openModal();
    }

    openModal () {
        this.ControllerHelper.modal.showModal({
            modalConfig: {
                templateUrl: "app/dbaas/logs/detail/tokens/add/logs-token-add.html",
                controller: "LogsTokenAddCtrl",
                controllerAs: "ctrl"
            }
        }).then(() => this.$scope.$parent.ctrl.initLoaders())
            .finally(() => this.onCloseModal());
    }

    onCloseModal () {
        this.$state.go("dbaas.logs.detail.tokens");
    }
}

angular.module("managerApp").controller("LogsTokenAddModalCtrl", LogsTokenAddModalCtrl);
