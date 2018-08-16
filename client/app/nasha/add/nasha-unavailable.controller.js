class NashaUnavailableCtrl {
    constructor (OvhApiMe, PhoneContact) {
        this.OvhApiMe = OvhApiMe;
        this.PhoneContact = PhoneContact;
    }

    $onInit () {
        this.OvhApiMe.v6().get().$promise.then(me => {
            this.phone = this.PhoneContact[me.ovhSubsidiary]
        });
    }
}

angular.module("managerApp").controller("NashaUnavailableCtrl", NashaUnavailableCtrl);
