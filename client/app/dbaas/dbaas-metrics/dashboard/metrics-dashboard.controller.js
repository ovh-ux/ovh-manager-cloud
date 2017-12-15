(() => {
    class MetricsDashboardCtrl {
        constructor ($scope, $stateParams, $q, $translate, CloudMessage, ControllerHelper, FeatureAvailabilityService, MetricService, METRICS_ENDPOINTS, RegionService,
                     SidebarMenu) {
            this.$scope = $scope;
            this.$stateParams = $stateParams;
            this.$q = $q;
            this.$translate = $translate;
            this.serviceName = $stateParams.serviceName;
            this.ControllerHelper = ControllerHelper;
            this.CloudMessage = CloudMessage;
            this.FeatureAvailabilityService = FeatureAvailabilityService;
            this.MetricService = MetricService;
            this.graphs = METRICS_ENDPOINTS.graphs;
            this.RegionService = RegionService;
            this.SidebarMenu = SidebarMenu;

            this.loading = {};
            this.limit = {
                warning: 70,
                danger: 85
            };
            this.usage = {};
            this.configuration = {};
            this.plan = {};
            this.actions = {};
        }

        $onInit () {
            this.loading.service = true;
            this.loading.consumption = true;
            this.loading.plan = true;
            this.initTiles();
        }

        initTiles () {
            this.initActions();
            this.MetricService.getService(this.serviceName)
                .then(service => {
                    this.usage.quota = {
                        mads: service.data.quota.mads,
                        ddp: service.data.quota.ddp
                    };
                    this.configuration = {
                        name: service.data.name,
                        description: service.data.description,
                        retention: service.data.quota.retention,
                        datacenter: this.transformRegion(service.data.region.name)
                    };
                    this.plan.offer = service.data.offer;
                })
                .finally(() => {
                    this.loading.service = false;
                });

            this.MetricService.getConsumption(this.serviceName)
                .then(cons => {
                    this.usage.conso = { mads: cons.data.mads, ddp: cons.data.ddp };
                    this.initMessages();
                })
                .finally(() => {
                    this.loading.consumption = false;
                });

            this.MetricService.getServiceInfos(this.serviceName)
                .then(info => {
                    this.plan = info.data;
                    return this.MetricService.getService(this.serviceName);
                })
                .then(service => {
                    this.plan.offer = service.data.offer;
                })
                .finally(() => {
                    this.loading.plan = false;
                });
        }

        initMessages () {
            if (this.computeUsage(this.usage.conso.mads, this.usage.quota.mads) > this.limit.warning) {
                this.CloudMessage.warning(this.$translate.instant("metrics_quota_mads_warning_message"));
            }
            if (this.computeUsage(this.usage.conso.ddp, this.usage.quota.ddp) > this.limit.warning) {
                this.CloudMessage.warning(this.$translate.instant("metrics_quota_ddp_warning_message"));
            }
        }

        initActions () {
            this.actions = {
                autorenew: {
                    text: this.$translate.instant("common_manage"),
                    href: this.ControllerHelper.navigation.getUrl("renew", { serviceName: this.serviceName, serviceType: "METRICS" }),
                    isAvailable: () => true
                },
                contacts: {
                    text: this.$translate.instant("common_manage"),
                    href: this.ControllerHelper.navigation.getUrl("contacts", { serviceName: this.serviceName }),
                    isAvailable: () => this.FeatureAvailabilityService.hasFeature("CONTACTS", "manage")
                },
                editName: {
                    text: this.$translate.instant("metrics_tiles_modify"),
                    callback: () => this.showEditName(this.configuration.description),
                    isAvailable: () => true
                }
            };
        }

        computeUsage (value, total) {
            return value / total * 100;
        }

        displayUsage (value, total) {
            if (!value && !total) {
                return "0";
            }
            return `${value}/${total}`;
        }

        computeColor (value, total) {
            const green = "#B0CA67";
            const yellow = "#E3CD4D";
            const red = "#B04020";
            if (this.computeUsage(value, total) > this.limit.danger) {
                return red;
            } else if (this.computeUsage(value, total) > this.limit.warning) {
                return yellow;
            }
            return green;

        }

        transformRegion (regionCode) {
            const region = this.RegionService.getRegion(regionCode);
            return { name: region.microRegion.text, country: region.country, flag: region.icon };
        }

        showEditName (desc) {
            this.ControllerHelper.modal.showModal({
                modalConfig: {
                    templateUrl: "app/dbaas/dbaas-metrics/dashboard/edit/metrics-dashboard-edit.html",
                    controller: "MetricsDashboardEditCtrl",
                    controllerAs: "$ctrl",
                    resolve: {
                        metricsType: () => "name",
                        metricsValue: () => desc,
                        serviceName: () => this.serviceName
                    }
                },
                successHandler: result => {
                    this.configuration.description = result.data.description;
                    this.$scope.$emit("changeDescription", this.configuration.description);

                    const menuItem = this.SidebarMenu.getItemById(this.serviceName);
                    menuItem.title = this.configuration.description;
                }
            });

        }

    }

    angular.module("managerApp").controller("MetricsDashboardCtrl", MetricsDashboardCtrl);
})();
