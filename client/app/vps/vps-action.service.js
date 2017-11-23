class VpsActionService {
    constructor (ControllerHelper) {
        this.ControllerHelper = ControllerHelper;
    }

    password (serviceName) {
        return this.ControllerHelper.modal.showModal({
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
        return this.ControllerHelper.modal.showModal({
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
        return this.ControllerHelper.modal.showModal({
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
        return this.ControllerHelper.modal.showModal({
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
        return this.ControllerHelper.modal.showModal({
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
        return this.ControllerHelper.modal.showModal({
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
        return this.ControllerHelper.modal.showModal({
            modalConfig: {
                templateUrl: "app/vps/modal/edit-name/vps-edit-name.html",
                controller: "VpsEditNameCtrl",
                controllerAs: "$ctrl",
                resolve: {
                    displayName: () => displayName,
                    serviceName: () => serviceName
                }
            }
        });
    }

    deleteSecondaryDns (serviceName, domain) {
        return this.ControllerHelper.modal.showModal({
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
        return this.ControllerHelper.modal.showModal({
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

    deleteBackupStorage (serviceName, access) {
        return this.ControllerHelper.modal.showModal({
            modalConfig: {
                templateUrl: "app/vps/modal/backup-storage/delete-backup-storage.html",
                controller: "DeleteBackupStorageCtrl",
                controllerAs: "$ctrl",
                resolve: {
                    serviceName: () => serviceName,
                    access: () => access
                }
            }
        });
    }

    addBackupStorage (serviceName) {
        return this.ControllerHelper.modal.showModal({
            modalConfig: {
                templateUrl: "app/vps/modal/backup-storage/add-backup-storage.html",
                controller: "AddBackupStorageCtrl",
                controllerAs: "$ctrl",
                resolve: {
                    serviceName: () => serviceName
                }
            }
        });
    }

    restore (serviceName, restorePoint) {
        return this.ControllerHelper.modal.showModal({
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
        return this.ControllerHelper.modal.showModal({
            modalConfig: {
                templateUrl: "app/vps/modal/veeam/mount/vps-mount.html",
                controller: "VpsMountCtrl",
                controllerAs: "$ctrl",
                resolve: {
                    serviceName: () => serviceName,
                    RestorePoint: () => restorePoint,
                    mount: () => true
                }
            }
        });
    }

    unmount (serviceName, restorePoint) {
        return this.ControllerHelper.modal.showModal({
            modalConfig: {
                templateUrl: "app/vps/modal/veeam/mount/vps-mount.html",
                controller: "VpsMountCtrl",
                controllerAs: "$ctrl",
                resolve: {
                    serviceName: () => serviceName,
                    RestorePoint: () => restorePoint,
                    mount: () => false
                }
            }
        });
    }

    orderAdditionalDisk () {
        return this.ControllerHelper.modal.showModal({
            modalConfig: {
                templateUrl: "app/vps/modal/additional-disk/order-disk.html",
                controller: "OrderAdditionalDiskCtrl",
                controllerAs: "$ctrl"
            }
        });
    }

}

angular.module("managerApp").service("VpsActionService", VpsActionService);
