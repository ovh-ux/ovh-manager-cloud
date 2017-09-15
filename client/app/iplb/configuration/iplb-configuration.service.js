class IpLoadBalancerConfigurationService {
    constructor ($q, IpLoadBalancing, RegionService, ServiceHelper) {
        this.$q = $q;
        this.IpLoadBalancing = IpLoadBalancing;
        this.RegionService = RegionService;
        this.ServiceHelper = ServiceHelper;
    }

    getPendingChanges (serviceName) {
        return this.IpLoadBalancing.Lexi().pendingChanges({ serviceName })
            .$promise;
    }

    getAllZonesChanges (serviceName) {
        return this.$q.all({
            description: this.IpLoadBalancing.Lexi().get({ serviceName }),
            pendingChanges: this.getPendingChanges(serviceName),
            tasks: this.getRefreshTasks(serviceName)
        })
            .then(({ description, pendingChanges, tasks }) => description.zone.map(zone => {
                const pending = _.find(pendingChanges, { zone });
                return {
                    id: zone,
                    name: this.RegionService.getRegion(zone).microRegion.text,
                    changes: pending ? pending.number : 0,
                    task: this.getLastUndoneTask(tasks, zone)
                };
            }))
            .catch(this.ServiceHelper.errorHandler("iplb_configuration_info_error"));
    }

    getZoneChanges (serviceName, zone) {
        return this.$q.all({
            pendingChanges: this.getPendingChanges(serviceName),
            tasks: this.getRefreshTasks(serviceName)
        })
            .then(({ pendingChanges, tasks }) => {
                const pending = _.find(pendingChanges, { zone });
                return {
                    id: zone,
                    name: this.RegionService.getRegion(zone).microRegion.text,
                    changes: pending ? pending.number : 0,
                    task: this.getLastUndoneTask(tasks, zone)
                };
            })
            .catch(this.ServiceHelper.errorHandler("iplb_configuration_info_error"));
    }

    getLastUndoneTask (tasks, zone) {
        const result = tasks.sort((a, b) => {
            if (a.creationDate > b.creationDate) {
                return -1;
            } else if (a.creationDate === b.creationDate) {
                return 0;
            }

            return 1;
        });
        return _.find(result, task => task.zones && task.zones.indexOf(zone) > -1);
    }

    refresh (serviceName, zone) {
        return this.IpLoadBalancing.Lexi().refresh({
            serviceName
        }, {
            zone
        })
            .$promise
            .then(this.ServiceHelper.successHandler("iplb_configuration_apply_success"))
            .catch(this.ServiceHelper.errorHandler("iplb_configuration_apply_error"));
    }

    batchRefresh (serviceName, zones) {
        const promises = zones.map(zone => this.IpLoadBalancing.Lexi().refresh({
            serviceName
        }, {
            zone
        }).$promise);
        return this.$q.all(promises)
            .then(this.ServiceHelper.successHandler("iplb_configuration_apply_success"))
            .catch(this.ServiceHelper.errorHandler("iplb_configuration_apply_error"));
    }

    getRefreshTasks (serviceName) {
        return this.IpLoadBalancing.Task().Lexi().query({
            serviceName,
            action: "deployIplb"
        })
            .$promise
            .then(ids => this.$q.all(ids.map(id => this.IpLoadBalancing.Task().Lexi().get({
                serviceName,
                taskId: id
            }).$promise)));
    }
}

angular.module("managerApp").service("IpLoadBalancerConfigurationService", IpLoadBalancerConfigurationService);
