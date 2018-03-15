class LogsAccountPasswordModalCtrl {
    constructor ($scope, $state, ControllerHelper) {
        this.$scope = $scope;
        this.$state = $state;
        this.ControllerHelper = ControllerHelper;
        this.openModal();
    }

    openModal () {
        console.log("open modal");
        this.ControllerHelper.modal.showModal({
            modalConfig: {
                templateUrl: "app/dbaas/logs/detail/account/password/logs-account-password.html",
                controller: "LogsAccountPasswordCtrl",
                controllerAs: "ctrl"
            }
        }).then(() => this.$scope.$parent.ctrl.initLoaders())
            .finally(() => this.onCloseModal());
    }

    onCloseModal () {
        this.$state.go("dbaas.logs.detail.home");
    }
}

angular.module("managerApp").controller("LogsAccountPasswordModalCtrl", LogsAccountPasswordModalCtrl);
