class IpLoadBalancerHomeService {
    constructor ($q, $translate, SidebarMenu, IpLoadBalancing, IpLoadBalancerCipherService, RegionService, ServiceHelper) {
        this.$q = $q;
        this.$translate = $translate;
        this.SidebarMenu = SidebarMenu;
        this.IpLoadBalancing = IpLoadBalancing;
        this.IpLoadBalancerCipherService = IpLoadBalancerCipherService;
        this.RegionService = RegionService;
        this.ServiceHelper = ServiceHelper;
    }

    getStatus () {
        //  TODO: Do something
    }

    getUsage () {
        //  TODO: Do something
    }

    getGraph () {
        //  TODO: Do something
    }

    getInformations (serviceName) {
        return this.$q.all({
            configuration: this.IpLoadBalancing.Lexi().get({ serviceName }).$promise,
            failoverIp: this.IpLoadBalancing.Lexi().failoverIp({ serviceName }).$promise,
            natIp: this.IpLoadBalancing.Lexi().natIp({ serviceName }).$promise
        })
            .then(response => ({
                ipV4: response.configuration.ipLoadbalancing,
                ipV6: response.configuration.ipv6,
                failoverIp: response.failoverIp,
                natIp: response.natIp
            }))
            .catch(this.ServiceHelper.errorHandler("iplb_information_loading_error"));
    }

    getConfiguration (serviceName) {
        return this.IpLoadBalancing.Lexi().get({ serviceName })
            .$promise
            .then(response => {
                response.displayName = response.displayName || response.serviceName;
                response.sslConfiguration = this.IpLoadBalancerCipherService.transformCipher(response.sslConfiguration);
                return response;
            })
            .catch(this.ServiceHelper.errorHandler("iplb_configuration_loading_error"));
    }

    updateName (serviceName, newName) {
        return this.IpLoadBalancing.Lexi().put({ serviceName }, { displayName: newName })
            .$promise
            .then(response => {
                this.getConfiguration(serviceName).then(configuration => this.changeMenuTitle(serviceName, configuration.displayName || serviceName));
                return response;
            })
            .catch(this.ServiceHelper.errorHandler("iplb_modal_name_change_updating_error"));
    }

    changeMenuTitle (serviceName, displayName) {
        const menuItem = this.SidebarMenu.getItemById(serviceName);
        if (menuItem) {
            menuItem.title = displayName;
        }
    }

    getSubscription (serviceName) {
        return this.$q.all({
            configuration: this.IpLoadBalancing.Lexi().get({ serviceName }).$promise,
            serviceInfos: this.IpLoadBalancing.Lexi().serviceInfos({ serviceName }).$promise
        })
            .then(response => _.extend(response.serviceInfos, { offer: response.configuration.offer }))
            .catch(this.ServiceHelper.errorHandler("iplb_subscription_loading_error"));
    }
}

angular.module("managerApp").service("IpLoadBalancerHomeService", IpLoadBalancerHomeService);
