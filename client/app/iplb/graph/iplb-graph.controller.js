class IpLoadBalancerGraphCtrl {
    constructor ($stateParams) {
        this.$stateParams = $stateParams;
    }
}

angular.module("managerApp").controller("IpLoadBalancerGraphCtrl", IpLoadBalancerGraphCtrl);
