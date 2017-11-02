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

    deleteSecondaryDns (domain) {
        // this.ControllerHelper.modal.showModal({
        //     modalConfig: {
        //         templateUrl: "app/vps/modal/reboot/vps-reboot.html",
        //         controller: "VpsRebootCtrl",
        //         controllerAs: "$ctrl",
        //         resolve: {
        //             domain: () => domain
        //         }
        //     }
        // });
    }

    addSecondaryDns () {
        this.ControllerHelper.modal.showModal({
            modalConfig: {
                templateUrl: "app/vps/modal/secondary-dns/add-secondary-dns.html",
                controller: "AddSecondaryDnsCtrl",
                controllerAs: "$ctrl"
            }
        });
    }

}

angular.module("managerApp").service("VpsActionService", VpsActionService);
