class CloudProjectComputeInfrastructureListCtrl {
    constructor ($scope, $q, $stateParams, $translate,
                 CloudMessage, CloudProjectOrchestrator, CloudProjectComputeInfrastructureService,
                 OvhApiCloudProjectVolume, OvhCloudPriceHelper, RegionService, OvhApiCloudProjectFlavor) {
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
        this.OvhApiCloudProjectFlavor = OvhApiCloudProjectFlavor;
    }

    $onInit () {
        this.serviceName = this.$stateParams.projectId;

        this.loaders = {
            infra: false
        };

        this.table = {
            items: undefined
        };

        this.statusOptions = {
            values: {
                OK: this.$translate.instant("cpci_vm_status_OK"),
                UPDATING: this.$translate.instant("cpci_vm_status_UPDATING"),
                REBOOT: this.$translate.instant("cpci_vm_status_REBOOT"),
                BUILD: this.$translate.instant("cpci_vm_status_BUILD"),
                REBUILD: this.$translate.instant("cpci_vm_status_REBUILD"),
                RESCUE: this.$translate.instant("cpci_vm_status_RESCUE"),
                SNAPSHOTTING: this.$translate.instant("cpci_vm_status_SNAPSHOTTING"),
                ERROR: this.$translate.instant("cpci_vm_status_ERROR"),
                DELETING: this.$translate.instant("cpci_vm_status_DELETING")
            }
        };

        this.regionOptions = {
            values: this.RegionService.getAllTranslatedMacroRegion()
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
            volumes: this.CloudProjectOrchestrator.initVolumes({ serviceName: this.serviceName }).then(volumes => (this.volumes = _.get(volumes, "volumes"))),
        }).then(({ infra }) => {
            this.infra = infra;
            return this.$q.all(_.map(this.infra.vrack.publicCloud.items, instance => {
                 return this.OvhApiCloudProjectFlavor.Lexi().get({ serviceName: this.serviceName, flavorId: instance.flavorId }).$promise
                 .then((flavor) => {
                     return {
                        volumes: _.get(this.volumes, instance.id, []),
                        ipv4: instance.getPublicIpv4(),
                        ipv6: instance.getPublicIpv6(),
                        region: instance.region,
                        macroRegion: this.RegionService.getMacroRegion(instance.region),
                        statusToTranslate: this.getStatusToTranslate(instance),
                        name: instance.name,
                        price: instance.price,
                        status: instance.status,
                        monthlyBillingBoolean: instance.monthlyBillingBoolean,
                        monthlyBilling: instance.monthlyBilling,
                        id: instance.id,
                        getStatusGroup: instance.getStatusGroup,
                        //patch for some translations that have &#160; html entities
                        flavorTranslated: this.$translate.instant(`cpci_vm_flavor_category_${flavor.name}`).replace("&#160;"," "),
                     };
                 });
            }))
            .then(instances => this.table.items = instances);
        }).catch(err => {
            this.table.items = [];
            this.CloudMessage.error(`${this.$translate.instant("cpci_errors_init_title")} : ${_.get(err, "data.message", "")}`);
            return this.$q.reject(err);
        }).finally(() => {
            this.loaders.infra = false;
        });
    }

    getStatusToTranslate(instance) {
        if (instance.status === "ACTIVE" && instance.monthlyBilling && instance.monthlyBilling.status === "activationPending") {
            return "UPDATING";
        } else if (instance.status === "ACTIVE") {
            return "OK";
        } else if (instance.status === "REBOOT" || instance.status === "HARD_REBOOT" || instance.status === "RESCUING" || instance.status === "UNRESCUING") {
            return "REBOOT";
        } else {
            return instance.status;
        }
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
