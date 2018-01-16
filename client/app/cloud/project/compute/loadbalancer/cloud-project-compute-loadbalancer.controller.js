class CloudProjectComputeLoadbalancerCtrl {
    constructor ($q, $translate, $state, $stateParams, CloudProjectComputeLoadbalancerService, OvhApiCloudProjectIplb, OvhApiIpLoadBalancing, CloudMessage, OvhApiMe, URLS) {
        this.$q = $q;
        this.$translate = $translate;
        this.$state = $state;
        this.CloudProjectComputeLoadbalancerService = CloudProjectComputeLoadbalancerService;
        this.OvhApiCloudProjectIplb = OvhApiCloudProjectIplb;
        this.OvhApiIpLoadBalancing = OvhApiIpLoadBalancing;
        this.CloudMessage = CloudMessage;
        this.OvhApiMe = OvhApiMe;

        this.serviceName = $stateParams.projectId;

        // Datas
        this.table = {
            loadbalancer: []
        };

        // Order link
        this.urls = URLS;
        this.locale = "";
        // Init locale for order link
        OvhApiMe.Lexi().get().$promise.then(user => { this.locale = user.ovhSubsidiary.toUpperCase(); });

        // Loader during Datas requests
        this.loaders = {
            table: {
                loadbalancer: false
            }
        };
    }

    $onInit () {
        this.getLoadbalancers(true);
    }

    goToLoadbalancerConfigure (serviceName) {
        this.$state.go("iaas.pci-project.compute.loadbalancerConfigure", {
            loadbalancerId: serviceName
        });
    }

    goToIPLB (serviceName) {
        this.$state.go("network.iplb.detail.home", {
            serviceName
        });
    }

    getLoadbalancers (clearCache) {
        if (!this.loaders.table.loadbalancer) {
            this.loaders.table.loadbalancer = true;
            if (clearCache) {
                this.OvhApiCloudProjectIplb.Lexi().resetQueryCache();
                this.OvhApiIpLoadBalancing.Lexi().resetQueryCache();
            }
            this.$q.all({
                loadbalancers:
                    this.OvhApiIpLoadBalancing.Lexi().query().$promise.then(response => this.$q.all(
                        _.map(response, id => this.CloudProjectComputeLoadbalancerService.getLoadbalancer(id))
                    )),
                loadbalancersImportedArray:
                    this.OvhApiCloudProjectIplb.Lexi().query({
                        serviceName: this.serviceName
                    }).$promise.then(ids => this.$q.all(
                        _.map(ids, id =>
                            this.OvhApiCloudProjectIplb.Lexi().get({
                                serviceName: this.serviceName,
                                id
                            }).$promise
                        )
                    ))
            }).then(({ loadbalancers, loadbalancersImportedArray }) => {
            // Create a map of imported loadbalancers
                const loadBalancerImported = {};
                _.forEach(loadbalancersImportedArray, lb => { loadBalancerImported[lb.iplb] = lb; });

                // Set openstack importation status
                this.table.loadbalancer = _.map(loadbalancers, lb => {
                    if (loadBalancerImported[lb.serviceName]) {
                        lb.openstack = loadBalancerImported[lb.serviceName].status;
                    } else {
                        lb.openstack = "not_imported";
                    }
                    return lb;
                });
            }).catch(err => {
                this.table.loadbalancer = null;
                this.CloudMessage.error([this.$translate.instant("cpc_loadbalancer_error"), err.data && err.data.message || ""].join(" "));
            }).finally(() => { this.loaders.table.loadbalancer = false; });
        }
    }
}

angular.module("managerApp").controller("CloudProjectComputeLoadbalancerCtrl", CloudProjectComputeLoadbalancerCtrl);
