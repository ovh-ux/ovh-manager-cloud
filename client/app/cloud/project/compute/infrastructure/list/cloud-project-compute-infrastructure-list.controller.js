class CloudProjectComputeInfrastructureListCtrl {
    constructor ($scope, $q, $stateParams, $translate,
                 CloudMessage, CloudProjectOrchestrator, CloudProjectComputeInfrastructureService,
                 OvhApiCloudProjectVolume, RegionService) {
        this.$scope = $scope;
        this.$q = $q;
        this.$stateParams = $stateParams;
        this.$translate = $translate;
        this.CloudMessage = CloudMessage;
        this.CloudProjectOrchestrator = CloudProjectOrchestrator;
        this.InfrastructureService = CloudProjectComputeInfrastructureService;
        this.OvhApiCloudProjectVolume = OvhApiCloudProjectVolume;
        this.RegionService = RegionService;
    }

    $onInit () {
        this.serviceName = this.$stateParams.projectId;

        this.loaders = {
            infra: false
        };

        this.table = {
            items: undefined
        };

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
}

angular.module("managerApp").controller("CloudProjectComputeInfrastructureListCtrl", CloudProjectComputeInfrastructureListCtrl);
