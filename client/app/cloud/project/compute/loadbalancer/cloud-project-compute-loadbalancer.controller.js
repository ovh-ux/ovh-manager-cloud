class CloudProjectComputeLoadbalancerCtrl {
    constructor ($q, $translate, $stateParams, CloudProjectComputeLoadbalancerService, OvhApiCloudProjectIplb, OvhApiIpLoadBalancing, CloudMessage, OvhApiMe, URLS) {
        this.$q = $q;
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
                laodbalancersImportedArray:
                this.OvhApiCloudProjectIplb.Lexi().query({
                    serviceName: this.serviceName
                }).$promise.then(ids => this.$q.all(
                    _.map(ids, id =>
                        this.OvhApiCloudProjectIplb.Lexi().get({
                            serviceName: this.serviceName,
                            id
                        }).$promise
                    )
                )
                )
            }).then(({ loadbalancers, laodbalancersImportedArray }) => {
            // Create a map of imported loadbalancers
                const loadBalancerImported = {};
                _.forEach(laodbalancersImportedArray, lb => { loadBalancerImported[lb.iplb] = lb; });

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

    actionTemplate () {
        return `
                <cui-dropdown-menu>
                   <cui-dropdown-menu-button>
                       <ng-include src="'app/ui-components/icons/button-action.html'"></ng-include>
                   </cui-dropdown-menu-button>
                   <cui-dropdown-menu-body>
                       <div class="oui-action-menu">
                           <div class="oui-action-menu__item oui-action-menu-item" ng-if="$row.status !== 'unavailable'">
                                   <div class="oui-action-menu-item__icon"><i class="glyphicon glyphicon-edit right-space-m8"></i></div>
                                   <a class="oui-button oui-button_link oui-action-menu-item__label"
                                      data-ui-sref="iaas.pci-project.compute.loadbalancer.configure({'loadbalancerId' : $row.serviceName})"
                                      data-translate="cpc_loadbalancer_actions_configure">
                                   </a>
                            </div>
                            <div class="oui-action-menu__item oui-action-menu-item" ng-if="$row.status === 'unavailable'">
                                    <div class="oui-action-menu-item__icon"><i class="glyphicon glyphicon-edit right-space-m8"></i></div>
                                    <a class="oui-button oui-button_link oui-action-menu-item__label"
                                       data-ui-sref="network.iplb.detail.home({'serviceName': $row.serviceName})"
                                       data-translate="cpc_loadbalancer_configure_advanced">
                                    </a>
                             </div>
                       </div>
                   </cui-dropdown-menu-body>
               </cui-dropdown-menu>
        `;
    }
}

angular.module("managerApp").controller("CloudProjectComputeLoadbalancerCtrl", CloudProjectComputeLoadbalancerCtrl);
