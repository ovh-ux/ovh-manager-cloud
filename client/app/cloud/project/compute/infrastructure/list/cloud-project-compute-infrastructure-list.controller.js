(() => {
    class CloudProjectComputeInfrastructureListCtrl {
        constructor ($scope, $filter, $q, $stateParams, CloudProjectComputeInfrastructureService, CloudProjectComputeInfraVrackVmFactory, OvhApiCloudPrice, OvhApiCloudProjectInstance, OvhApiCloudProjectVolume, RegionService) {
            this.$scope = $scope;
            this.$filter = $filter;
            this.$q = $q;
            this.$stateParams = $stateParams;
            this.InfrastructureService = CloudProjectComputeInfrastructureService;
            this.InfraVrackVmFactory = CloudProjectComputeInfraVrackVmFactory;
            this.OvhApiCloudPrice = OvhApiCloudPrice;
            this.OvhApiCloudProjectInstance = OvhApiCloudProjectInstance;
            this.OvhApiCloudProjectVolume = OvhApiCloudProjectVolume;
            this.RegionService = RegionService;
        }

        $onInit () {
            this.serviceName = this.$stateParams.projectId;
            this.loaders = {
                infra: true,
                pager: true
            };

            this.order = {
                by: null,
                reverse: false
            };

            this.table = {
                itemsPaginated: []
            };

            return this.$q.all({
                prices: this.OvhApiCloudPrice.Lexi().query().$promise,
                volumes: this.OvhApiCloudProjectVolume.Lexi().query({ serviceName: this.serviceName }).$promise
            }).then(({ prices, volumes }) => {
                this.prices = prices;
                this.volumes = volumes;
                this.initInfra();
            });
        }

        initInfra () {
            // return this.CloudProjectOrchestrator.initInfrastructure({ serviceName: this.serviceName })
            //     .then(infra => {
            //         this.infra = infra;
            //         this.table.items = this.infra.vrack.publicCloud.sortedKeys;
            //     }).finally(() => {
            //         this.loaders.infra = false;
            //     });

            return this.OvhApiCloudProjectInstance.Lexi().query({
                serviceName: this.serviceName
            }).$promise.then(instances => {
                this.table.items = instances;
            }).finally(() => {
                this.loaders.infra = false;
            });
        }

        orderBy (by) {
            if (by) {
                if (this.order.by === by) {
                    this.order.reverse = !this.order.reverse;
                } else {
                    this.order.by = by;
                }
            }
            this.table.items = this.$filter("orderBy")(this.table.items, this.order.by, this.order.reverse);
            this.table.itemsPaginated = this.$filter("orderBy")(this.table.itemsPaginated, this.order.by, this.order.reverse);
        }

        transformItem (item) {
            return this.OvhApiCloudProjectInstance.Lexi().get({
                serviceName: this.serviceName,
                instanceId: item.id
            }).$promise.then(instance => {
                _.set(instance, "serviceName", this.serviceName);
                _.set(instance, "price", _.find(this.prices.instances, flavor => flavor.flavorId === instance.flavor.id));
                _.set(instance, "volumes", _.filter(this.volumes, volume => _.indexOf(volume.attachedTo, instance.id) >= 0));
                return new this.InfraVrackVmFactory(instance);
            });
        }

        onTransformItemDone () {
            this.loaders.pager = false;
        }
    }

    angular.module("managerApp").controller("CloudProjectComputeInfrastructureListCtrl", CloudProjectComputeInfrastructureListCtrl);
})();
