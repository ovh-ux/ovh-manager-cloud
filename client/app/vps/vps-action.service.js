class VpsActionService {
    constructor (ControllerHelper) {
        this.ControllerHelper = ControllerHelper;
    }

    password () {
        this.ControllerHelper.modal.showModal({
            modalConfig: {
                templateUrl: "app/vps/modal/shortcut/password/vps-password.html",
                controller: "VpsPasswordCtrl",
                controllerAs: "$ctrl"
            }
        });
    }

    reboot () {
        this.ControllerHelper.modal.showModal({
            modalConfig: {
                templateUrl: "app/vps/modal/shortcut/reboot/vps-reboot.html",
                controller: "VpsRebootCtrl",
                controllerAs: "$ctrl"
            }
        });
    }

    reinstall () {
        this.ControllerHelper.modal.showModal({
            modalConfig: {
                templateUrl: "app/vps/modal/shortcut/reinstall/vps-reinstall.html",
                controller: "VpsReinstallCtrl",
                controllerAs: "$ctrl"
            }
        });
    }

    kvm (serviceName, hasKVM) {
        this.ControllerHelper.modal.showModal({
            modalConfig: {
                templateUrl: "app/vps/modal/shortcut/kvm/vps-kvm.html",
                controller: "VpsKvmCtrl",
                controllerAs: "$ctrl",
                resolve: {
                    serviceName: () => serviceName,
                    hasKVM: () => hasKVM
                }
            }
        });
    }

    editName (displayName, serviceName) {
        this.ControllerHelper.modal.showModal({
            modalConfig: {
                templateUrl: "app/vps/modal/edit-name/vps-edit-name.html",
                controller: "VpsEditNameCtrl",
                controllerAs: "$ctrl",
                resolve: {
                    displayName: () => displayName,
                    serviceName: () => serviceName
                }
            }
        })
    }

    deleteSecondaryDns (domain) {
        this.ControllerHelper.modal.showModal({
            modalConfig: {
                templateUrl: "app/vps/modal/secondary-dns/delete-secondary-dns.html",
                controller: "DeleteSecondaryDnsCtrl",
                controllerAs: "$ctrl",
                resolve: {
                    domain: () => domain
                }
            }
        });
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

    orderAdditionalDisk () {
        this.ControllerHelper.modal.showModal({
            modalConfig: {
                templateUrl: "app/vps/modal/additional-disk/order-disk.html",
                controller: "OrderAdditionalDiskCtrl",
                controllerAs: "$ctrl"
            }
        });
    }

}

angular.module("managerApp").service("VpsActionService", VpsActionService);
