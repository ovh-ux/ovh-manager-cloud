class IpLoadBalancerVrackEditCtrl {
    constructor ($q, CloudMessage, CloudNavigation) {
        this.$q = $q;
        this.CloudMessage = CloudMessage;
        this.CloudNavigation = CloudNavigation;

        this._initLoaders();
        this._initModel();
    }

    $onInit () {
        this.previousState = this.CloudNavigation.getPreviousState();
    }

    submit () {
        if (this.form.$invalid) {
            return this.$q.reject();
        }

        this.CloudMessage.flushChildMessage();
        return true;
    }

    isLoading () {
        return false;
    }

    _initLoaders () {
        console.log("do something");
    }

    _initModel () {
        console.log("do something");
    }
}

angular.module("managerApp").controller("IpLoadBalancerVrackEditCtrl", IpLoadBalancerVrackEditCtrl);