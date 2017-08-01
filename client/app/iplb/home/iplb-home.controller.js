class IpLoadBalancerHomeCtrl {
    constructor ($stateParams, $translate, ControllerHelper, IpLoadBalancerActionService, IpLoadBalancerHomeService, REDIRECT_URLS) {
        this.$stateParams = $stateParams;
        this.$translate = $translate;
        this.ControllerHelper = ControllerHelper;
        this.IpLoadBalancerActionService = IpLoadBalancerActionService;
        this.IpLoadBalancerHomeService = IpLoadBalancerHomeService;
        this.REDIRECT_URLS = REDIRECT_URLS;

        this.serviceName = this.$stateParams.serviceName;

        this.initLoaders();
    }

    $onInit () {
        this.configuration.load();
        this.information.load();
        this.subscription.load();

        this.initActions();
    }

    initLoaders () {
        this.information = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.IpLoadBalancerHomeService.getInformations(this.serviceName)
        });

        this.configuration = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.IpLoadBalancerHomeService.getConfiguration(this.serviceName)
        });

        this.subscription = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.IpLoadBalancerHomeService.getSubscription(this.serviceName)
        });
    }

    initActions () {
        this.actions = {
            showFailoverIp: {
                text: this.$translate.instant("common_consult"),
                callback: () => this.IpLoadBalancerActionService.showFailoverIpDetail(this.serviceName),
                isAvailable: () => !this.information.loading && !this.information.hasErrors && this.information.data.failoverIp.length
            },
            showNatIp: {
                text: this.$translate.instant("common_consult"),
                callback: () => this.IpLoadBalancerActionService.showNatIpDetail(this.serviceName),
                isAvailable: () => !this.information.loading && !this.information.hasErrors && this.information.data.natIp.length
            },
            changeName: {
                text: this.$translate.instant("common_edit"),
                callback: () => this.IpLoadBalancerActionService.nameChange(this.serviceName, () => this.configuration.load()),
                isAvailable: () => !this.configuration.loading && !this.configuration.hasErrors
            },
            changeCipher: {
                text: this.$translate.instant("common_edit"),
                callback: () => this.IpLoadBalancerActionService.cipherChange(this.serviceName, () => this.configuration.load()),
                isAvailable: () => !this.configuration.loading && !this.configuration.hasErrors
            },
            changeOffer: {
                text: this.$translate.instant("common_edit"),
                callback: () => this.IpLoadBalancerActionService.offerChange(this.serviceName),
                isAvailable: () => !this.subscription.loading && !this.subscription.hasErrors
            },
            manageAutorenew: {
                text: this.$translate.instant("common_manage"),
                href: this.ControllerHelper.navigation.getUrl("renew", { serviceName: this.serviceName, serviceType: "IP_LOADBALANCING" }),
                isAvailable: () => !this.subscription.loading && !this.subscription.hasErrors
            },
            manageContact: {
                text: this.$translate.instant("common_manage"),
                href: this.ControllerHelper.navigation.getUrl("contacts", { serviceName: this.serviceName }),
                isAvailable: () => !this.subscription.loading && !this.subscription.hasErrors
            }
        };
    }
}

angular.module("managerApp").controller("IpLoadBalancerHomeCtrl", IpLoadBalancerHomeCtrl);
