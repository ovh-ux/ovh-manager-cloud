(() => {
    class CloudProjectComputeInfrastructureListCtrl {
        constructor ($scope, $stateParams, $translate,
                     CloudMessage, CloudProjectComputeInfrastructureOrchestrator, CloudProjectComputeInfrastructureService,
                     OvhApiCloudProjectVolume, RegionService) {
            this.$scope = $scope;
            this.$stateParams = $stateParams;
            this.$translate = $translate;
            this.CloudMessage = CloudMessage;
            this.CloudProjectComputeInfrastructureOrchestrator = CloudProjectComputeInfrastructureOrchestrator;
            this.InfrastructureService = CloudProjectComputeInfrastructureService;
            this.OvhApiCloudProjectVolume = OvhApiCloudProjectVolume;
            this.RegionService = RegionService;
        }

        $onInit () {
            this.serviceName = this.$stateParams.projectId;

            this.loaders = {
                infra: false,
                init: true
            };

            this.table = {
                items: undefined
            };

            return this.OvhApiCloudProjectVolume.Lexi().query({ serviceName: this.serviceName }).$promise.then(volumes => {
                this.volumes = volumes;
            }).finally(() => {
                this.loaders.init = false;
                this.initInfra();
            });
        }

        initInfra () {
            this.loaders.infra = true;
            return this.CloudProjectComputeInfrastructureOrchestrator.init({ serviceName: this.serviceName }).then(infra => {
                this.infra = infra;
                this.table.items = _.map(this.infra.vrack.publicCloud.items, instance => {
                    if (this.volumes) {
                        _.set(instance, "volumes", _.filter(this.volumes, volume => _.indexOf(volume.attachedTo, instance.id) >= 0));
                    }
                    return instance;
                });
            }).catch(err => {
                this.table.items = [];
                this.CloudMessage.error(`${this.$translate.instant("cpci_errors_init_title")} ${_.get(err, "data.message", "")}`);
            }).finally(() => {
                this.loaders.infra = false;
            });
        }
    }

    angular.module("managerApp").controller("CloudProjectComputeInfrastructureListCtrl", CloudProjectComputeInfrastructureListCtrl);
})();
