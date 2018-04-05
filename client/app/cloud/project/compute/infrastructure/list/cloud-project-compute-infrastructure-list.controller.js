class CloudProjectComputeInfrastructureListCtrl {
    constructor ($scope, $q, $stateParams, $translate,
                 CloudMessage, CloudProjectOrchestrator, CloudProjectComputeInfrastructureService,
                 OvhApiCloudProjectVolume, OvhCloudPriceHelper, RegionService) {
        this.$scope = $scope;
        this.$q = $q;
        this.$stateParams = $stateParams;
        this.$translate = $translate;
        this.CloudMessage = CloudMessage;
        this.CloudProjectOrchestrator = CloudProjectOrchestrator;
        this.InfrastructureService = CloudProjectComputeInfrastructureService;
        this.OvhApiCloudProjectVolume = OvhApiCloudProjectVolume;
        this.RegionService = RegionService;
        this.OvhCloudPriceHelper = OvhCloudPriceHelper;
    }

    $onInit () {
        this.serviceName = this.$stateParams.projectId;

        this.loaders = {
            infra: false
        };

        this.table = {
            items: undefined
        };

        this.$scope.$watchCollection(() => _.get(this.infra, "vrack.publicCloud.sortedKeys"), (newValues, oldValues) => {
            this.addOrRemoveInstance(newValues, oldValues);
        });

        this.InfrastructureService.setPreferredView("list");

        return this.initInfra();
    }

    initInfra () {
        this.loaders.infra = true;
        return this.$q.all({
            infra: this.CloudProjectOrchestrator.initInfrastructure({ serviceName: this.serviceName }),
            volumes: this.CloudProjectOrchestrator.initVolumes({ serviceName: this.serviceName }).then(volumes => (this.volumes = _.get(volumes, "volumes")))
        }).then(({ infra }) => {
            this.infra = infra;
            this.table.items = _.map(this.infra.vrack.publicCloud.items, instance => {
                _.set(instance, "volumes", _.get(this.volumes, instance.id, []));
                return instance;
            });
        }).catch(err => {
            this.table.items = [];
            this.CloudMessage.error(`${this.$translate.instant("cpci_errors_init_title")} : ${_.get(err, "data.message", "")}`);
        }).finally(() => {
            this.loaders.infra = false;
        });
    }

    addOrRemoveInstance (newIds, oldIds) {
        if (oldIds != null) {
            if (newIds.length > oldIds.length) {
                const foundId = _.find(newIds, key => _.indexOf(oldIds, key) === -1);
                const foundItem = this.infra.vrack.publicCloud.items[foundId];
                if (foundItem) {
                    _.set(foundItem, "volumes", _.get(this.volumes, foundItem.id, []));
                    this.table.items.push(foundItem);
                }
            } else if (newIds.length < oldIds.length) {
                const foundId = _.find(oldIds, key => _.indexOf(newIds, key) === -1);
                _.remove(this.table.items, item => item.id === foundId);
            }
        }
    }
}

angular.module("managerApp").controller("CloudProjectComputeInfrastructureListCtrl", CloudProjectComputeInfrastructureListCtrl);
