class VpsActionService {
    constructor (ControllerHelper) {
        this.ControllerHelper = ControllerHelper;
    }

    rescue (serviceName) {
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

    monitoringSla (serviceName, state, preview) {
        return this.ControllerHelper.modal.showModal({
            modalConfig: {
                templateUrl: "app/vps/modal/shortcut/monitoring-sla/vps-monitoring-sla.html",
                controller: "VpsMonitoringSlaCtrl",
                controllerAs: "$ctrl",
                resolve: {
                    serviceName: () => serviceName,
                    preview: () => preview || false,
                    state: () => state
                }
            }
        });
    }

    displayIps (serviceName) {
        return this.ControllerHelper.modal.showModal({
            modalConfig: {
                templateUrl: "app/vps/modal/shortcut/display-ips/vps-display-ips.html",
                controller: "VpsDisplayIpsCtrl",
                controllerAs: "$ctrl",
                resolve: {
                    serviceName: () => serviceName
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

    resetPasswordBackupStorage (serviceName) {
        return this.ControllerHelper.modal.showModal({
            modalConfig: {
                templateUrl: "app/vps/modal/backup-storage/password-backup-storage.html",
                controller: "PasswordBackupStorageCtrl",
                controllerAs: "$ctrl",
                resolve: {
                    serviceName: () => serviceName
                }
            }
        });
    }

    editBackupStorage (serviceName, row) {
        return this.ControllerHelper.modal.showModal({
            modalConfig: {
                templateUrl: "app/vps/modal/backup-storage/edit-backup-storage.html",
                controller: "EditBackupStorageCtrl",
                controllerAs: "$ctrl",
                resolve: {
                    serviceName: () => serviceName,
                    row: () => row
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

    deleteSnapshot (serviceName) {
        return this.ControllerHelper.modal.showModal({
            modalConfig: {
                templateUrl: "app/vps/modal/snapshot/snapshot-delete.html",
                controller: "VpsDeleteSnapshotCtrl",
                controllerAs: "$ctrl",
                resolve: {
                    serviceName: () => serviceName
                }
            }
        });
    }

    takeSnapshot (serviceName) {
        return this.ControllerHelper.modal.showModal({
            modalConfig: {
                templateUrl: "app/vps/modal/snapshot/snapshot-take.html",
                controller: "VpsTakeSnapshotCtrl",
                controllerAs: "$ctrl",
                resolve: {
                    serviceName: () => serviceName
                }
            }
        });
    }

    restoreSnapshot (serviceName) {
        return this.ControllerHelper.modal.showModal({
            modalConfig: {
                templateUrl: "app/vps/modal/snapshot/snapshot-restore.html",
                controller: "VpsRestoreSnapshotCtrl",
                controllerAs: "$ctrl",
                resolve: {
                    serviceName: () => serviceName
                }
            }
        });
    }

    _terminateOption (serviceName, optionName) {
        return this.ControllerHelper.modal.showModal({
            modalConfig: {
                templateUrl: "app/vps/modal/option/vps-option-terminate.html",
                controller: "VpsOptionTerminateCtrl",
                controllerAs: "$ctrl",
                resolve: {
                    serviceName: () => serviceName,
                    vpsOption: () => optionName
                }
            }
        });
    }

    terminateAdditionalDiskOption (serviceName) {
        return this._terminateOption(serviceName, "additionalDisk");
    }

    terminateBackupStorageOption (serviceName) {
        return this._terminateOption(serviceName, "ftpBackup");
    }

    terminateSnapshotOption (serviceName) {
        return this._terminateOption(serviceName, "snapshot");
    }

    terminateVeeamOption (serviceName) {
        return this._terminateOption(serviceName, "automatedBackup");
    }

    terminateWindows (serviceName) {
        return this._terminateOption(serviceName, "windows");
    }
}

angular.module("managerApp").service("VpsActionService", VpsActionService);
