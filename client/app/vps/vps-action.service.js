class VpsActionService {
    constructor (ControllerHelper) {
        this.ControllerHelper = ControllerHelper;
    }

    password (serviceName) {
        this.ControllerHelper.modal.showModal({
            modalConfig: {
                templateUrl: "app/vps/modal/shortcut/password/vps-password.html",
                controller: "VpsPasswordCtrl",
                controllerAs: "$ctrl",
                resolve: {
                    serviceName: () => serviceName
                }
            }
        });
    }

    reboot (serviceName) {
        this.ControllerHelper.modal.showModal({
            modalConfig: {
                templateUrl: "app/vps/modal/shortcut/reboot/vps-reboot.html",
                controller: "VpsRebootCtrl",
                controllerAs: "$ctrl",
                resolve: {
                    serviceName: () => serviceName
                }
            }
        });
    }

    reinstall (serviceName) {
        this.ControllerHelper.modal.showModal({
            modalConfig: {
                templateUrl: "app/vps/modal/shortcut/reinstall/vps-reinstall.html",
                controller: "VpsReinstallCtrl",
                controllerAs: "$ctrl",
                resolve: {
                    serviceName: () => serviceName
                }
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

    monitoringSla (serviceName, state) {
        this.ControllerHelper.modal.showModal({
            modalConfig: {
                templateUrl: "app/vps/modal/shortcut/monitoring-sla/vps-monitoring-sla.html",
                controller: "VpsMonitoringSlaCtrl",
                controllerAs: "$ctrl",
                resolve: {
                    serviceName: () => serviceName,
                    state: () => state
                }
            }
        });
    }

    reverseDns (serviceName) {
        this.ControllerHelper.modal.showModal({
            modalConfig: {
                templateUrl: "app/vps/modal/shortcut/reverse-dns/vps-reverse-dns.html",
                controller: "VpsReverseDnsCtrl",
                controllerAs: "$ctrl",
                resolve: {
                    serviceName: () => serviceName
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

    deleteSecondaryDns (serviceName, domain) {
        this.ControllerHelper.modal.showModal({
            modalConfig: {
                templateUrl: "app/vps/modal/secondary-dns/delete-secondary-dns.html",
                controller: "DeleteSecondaryDnsCtrl",
                controllerAs: "$ctrl",
                resolve: {
                    serviceName: () => serviceName,
                    domain: () => domain
                }
            }
        });
    }

    addSecondaryDns (serviceName) {
        this.ControllerHelper.modal.showModal({
            modalConfig: {
                templateUrl: "app/vps/modal/secondary-dns/add-secondary-dns.html",
                controller: "AddSecondaryDnsCtrl",
                controllerAs: "$ctrl",
                resolve: {
                    serviceName: () => serviceName
                }
            }
        });
    }

    restore (serviceName, restorePoint) {
        this.ControllerHelper.modal.showModal({
            modalConfig: {
                templateUrl: "app/vps/modal/veeam/restore/vps-restore.html",
                controller: "VpsRestoreCtrl",
                controllerAs: "$ctrl",
                resolve: {
                    serviceName: () => serviceName,
                    RestorePoint: () => restorePoint
                }
            }
        });
    }

    mount (serviceName, restorePoint) {
        this.ControllerHelper.modal.showModal({
            modalConfig: {
                templateUrl: "app/vps/modal/veeam/mount/vps-mount.html",
                controller: "VpsMountCtrl",
                controllerAs: "$ctrl",
                resolve: {
                    serviceName: () => serviceName,
                    RestorePoint: () => restorePoint
                }
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
