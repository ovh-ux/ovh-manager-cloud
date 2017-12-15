class IpLoadBalancerHomeService {
    constructor ($q, SidebarMenu, IpLoadBalancerCipherService, OvhApiIpLoadBalancing, RegionService, ServiceHelper) {
        this.$q = $q;
        this.SidebarMenu = SidebarMenu;
        this.IpLoadBalancerCipherService = IpLoadBalancerCipherService;
        this.OvhApiIpLoadBalancing = OvhApiIpLoadBalancing;
        this.RegionService = RegionService;
        this.ServiceHelper = ServiceHelper;
    }

    getInformations (serviceName) {
        return this.$q.all({
            configuration: this.OvhApiIpLoadBalancing.Lexi().get({ serviceName }).$promise,
            failoverIp: this.OvhApiIpLoadBalancing.Lexi().failoverIp({ serviceName }).$promise,
            natIp: this.OvhApiIpLoadBalancing.Lexi().natIp({ serviceName }).$promise
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
        return this.OvhApiIpLoadBalancing.Lexi().get({ serviceName })
            .$promise
            .then(response => {
                response.displayName = response.displayName || response.serviceName;
                response.sslConfiguration = this.IpLoadBalancerCipherService.transformCipher(response.sslConfiguration);
                return response;
            })
            .catch(this.ServiceHelper.errorHandler("iplb_configuration_loading_error"));
    }

    getUsage (serviceName) {
        return this.OvhApiIpLoadBalancing.Quota().Lexi().query({ serviceName })
            .$promise
            .then(zones => this.$q.all(zones.map(zone => this.getUsageForZone(serviceName, zone))))
            .then(quotas => quotas.map(quota => {
                quota.region = this.RegionService.getRegion(quota.zone);
                return quota;
            }))
            .catch(this.ServiceHelper.errorHandler("iplb_usage_loading_error"));
    }

    getUsageForZone (serviceName, zoneName) {
        return this.OvhApiIpLoadBalancing.Quota().Lexi().get({
            serviceName,
            zoneName
        }).$promise;
    }

    updateQuota (serviceName, zoneName, alert) {
        return this.OvhApiIpLoadBalancing.Quota().Lexi().put({
            serviceName,
            zoneName
        }, {
            alert
        }).$promise
            .catch(this.ServiceHelper.errorHandler("iplb_utilisation_update_alert_error"));
    }

    updateName (serviceName, newName) {
        return this.OvhApiIpLoadBalancing.Lexi().put({ serviceName }, { displayName: newName })
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
            configuration: this.OvhApiIpLoadBalancing.Lexi().get({ serviceName }).$promise,
            serviceInfos: this.OvhApiIpLoadBalancing.Lexi().serviceInfos({ serviceName }).$promise
        })
            .then(response => _.extend(response.serviceInfos, { offer: response.configuration.offer }))
            .catch(this.ServiceHelper.errorHandler("iplb_subscription_loading_error"));
    }
}

angular.module("managerApp").service("IpLoadBalancerHomeService", IpLoadBalancerHomeService);
