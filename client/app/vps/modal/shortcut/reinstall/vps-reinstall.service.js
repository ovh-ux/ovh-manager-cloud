class VpsReinstallService {
    constructor (OvhApiMe) {
        this.OvhApiMe = OvhApiMe;
    }

    getSshKeys () {
        return this.OvhApiMe.SshKey().Lexi().get().$promise;
    }

}

angular.module("managerApp").service("VpsReinstallService", VpsReinstallService);
