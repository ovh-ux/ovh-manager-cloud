class VpsActionService {
    constructor (ControllerHelper) {
        this.ControllerHelper = ControllerHelper;
    }

    reboot () {
        this.ControllerHelper.modal.showModal({
            modalConfig: {
                templateUrl: "app/vps/modal/reboot/vps-reboot.html",
                controller: "VpsRebootCtrl",
                controllerAs: "$ctrl"
            }
        });
    }

}

angular.module("managerApp").service("VpsActionService", VpsActionService);
