class CloudProjectComputeInfrastructureIacAddCtrl {
    constructor ($q, $state, $stateParams, CloudFlavorService, CloudRegionService, CloudStackService,
                 OvhApiCloudProjectFlavor, OvhApiCloudProjectSshKey, OvhApiCloudProjectStack, OvhCloudPriceHelper,
                 CLOUD_INSTANCE_CPU_FREQUENCY, ControllerHelper, CurrencyService, RegionService, ServiceHelper, ovhDocUrl) {
        this.$q = $q;
        this.$state = $state;
        this.$stateParams = $stateParams;

        this.CloudFlavorService = CloudFlavorService;
        this.CloudRegionService = CloudRegionService;
        this.CloudStackService = CloudStackService;
        this.OvhApiCloudProjectFlavor = OvhApiCloudProjectFlavor;
        this.OvhApiCloudProjectSshKey = OvhApiCloudProjectSshKey;
        this.OvhApiCloudProjectStack = OvhApiCloudProjectStack;
        this.OvhCloudPriceHelper = OvhCloudPriceHelper;
        this.CLOUD_INSTANCE_CPU_FREQUENCY = CLOUD_INSTANCE_CPU_FREQUENCY;
        this.ControllerHelper = ControllerHelper;
        this.CurrencyService = CurrencyService;
        this.RegionService = RegionService;
        this.ServiceHelper = ServiceHelper;
        this.ovhDocUrl = ovhDocUrl;
    }

    $onInit () {
        this.serviceName = this.$stateParams.projectId;
        this.currentCurrency = this.CurrencyService.getCurrentCurrency();
        this.addingSshKey = false;
        this.loaders = {
            addingSsh: false
        };
        this.model = {};
        this.newSshKey = {
            name: null,
            publicKey: null
        };
        this.submitted = {};

        this.urls = {
            guidesSshkey: this.ovhDocUrl.getDocUrl("g1769.creating_ssh_keys")
        };
        this.getStacks();
    }

    cancel () {
        this.$state.go("iaas.pci-project.compute.infrastructure.list");
    }

    /* promo () {
        this.ControllerHelper.modal.showModal({
            modalConfig: {
                templateUrl: "app/cloud/project/compute/infrastructure/promo/cloud-project-compute-infrastructure-promo.html",
                controller: "CloudProjectComputeInfrastructurePromoCtrl",
                controllerAs: "ctrl"
            }
        });
    }*/

    /* Step 1: stacks */
    getStacks () {
        this.submitted.step1 = false;
        this.loaders.stacks = true;
        return this.$q.all({
            stacks: this.OvhApiCloudProjectStack.v6().query({ serviceName: this.serviceName }).$promise,
            prices: this.OvhCloudPriceHelper.getPrices(this.serviceName)
        })
            /* .then(({ stacks, prices }) => {
                this.prices = prices;
                return this.$q.all(_.map(stacks, stack => this.OvhApiCloudProjectStack.v6().get({ serviceName: this.serviceName, stackId: stack.uuid }).$promise));
            })*/
            .then(({ stacks, prices }) => {
                this.stacks = stacks;
                this.prices = prices;

                _.each(this.stacks, stack => {
                    this.CloudStackService.setFlavorsNumber(stack);
                    this.CloudStackService.setPrice(stack, this.prices);
                });
            })
            .catch(this.ServiceHelper.errorHandler("cpciiac_add_step1_general_ERROR"))
            .finally(() => {
                this.loaders.stacks = false;
            });
    }

    /* Step 2: regions and datacenters */
    getRegions () {
        this.submitted.step1 = true;
        this.loaders.regions = true;
        return this.OvhApiCloudProjectStack.v6().availability({ serviceName: this.serviceName, stackId: this.model.stack.uuid }).$promise
            .then(regions => {
                this.regions = _.map(regions.availableRegions, region => this.RegionService.getRegion(region));
                this.displayedRegions = this.CloudRegionService.groupRegionsByDatacenter(this.regions);
                this.groupedRegions = _.groupBy(this.displayedRegions, "continent");
            })
            .catch(this.ServiceHelper.errorHandler("cpciiac_add_step2_general_ERROR"))
            .finally(() => {
                this.loaders.regions = false;
            });
    }

    resetStep2 () {
        this.submitted.step2 = false;
        this.regions = null;
        this.resetStep3();
    }

    submitStep2 () {
        const OS_REGION_NAME = _.find(this.model.stack.inputs, { key: "OS_REGION_NAME" });
        _.set(OS_REGION_NAME, "value", _.get(this.model, "region.microRegion.code"));
        this.getSshKey();
    }

    /* Step 3: SSH Key */
    getSshKey () {
        this.submitted.step2 = true;
        this.loaders.sshKeys = true;
        return this.OvhApiCloudProjectSshKey.v6().query({ serviceName: this.serviceName, region: _.get(this.model, "region.microRegion.code") }).$promise
            .then(sshKeys => {
                this.sshKeys = sshKeys || [];
            })
            .catch(this.ServiceHelper.errorHandler("cpciiac_add_step3_general_ERROR"))
            .finally(() => {
                this.loaders.sshKeys = false;
            });
    }

    resetStep3 () {
        this.submitted.step3 = false;
        this.sshKeys = null;
        this.resetStep4();
    }

    submitStep3 () {
        const OS_KEYPAIR_NAME = _.find(this.model.stack.inputs, { key: "OS_KEYPAIR_NAME" });
        _.set(OS_KEYPAIR_NAME, "value", _.get(this.model, "sshKey.name"));
        this.getFlavors();
    }

    addSshKey () {
        if (this.newSshKey.name && this.newSshKey.publicKey) {
            this.loaders.addingSsh = true;
            return this.OvhApiCloudProjectSshKey.v6().save({ serviceName: this.serviceName }, this.newSshKey).$promise
                .then(newSshKey => {
                    this.OvhApiCloudProjectSshKey.v6().resetQueryCache();
                    return this.$q.all({
                        newSshKey,
                        sshKeys: this.OvhApiCloudProjectSshKey.v6().query({ serviceName: this.serviceName }).$promise
                    });
                })
                .then(({ newSshKey, sshKeys }) => {
                    this.sshKeys = sshKeys;
                    this.model.sshKey = newSshKey;
                })
                .catch(this.ServiceHelper.errorHandler("cpciiac_add_step3_sshKey_adding_ERROR"))
                .finally(() => {
                    this.resetAddingSshKey();
                    this.loaders.addingSsh = false;
                });
        }
        return false;
    }

    resetAddingSshKey () {
        this.model.sshKey = null;
        this.newSshKey.name = null;
        this.newSshKey.publicKey = null;
        this.addingSshKey = false;
    }

    /* Step 4: review and deploy */
    getFlavors () {
        this.submitted.step3 = true;
        this.loaders.flavors = true;
        return this.OvhApiCloudProjectFlavor.v6().query({ serviceName: this.serviceName, region: _.get(this.model, "region.microRegion.code") }).$promise
            .then(flavors => {
                const usedFlavors = _.get(this.model.stack, "resources.flavors", []);
                const usedFlavorNames = _.map(usedFlavors, flavor => flavor.flavor);
                this.flavors = _.map(_.filter(flavors, flavor => _.indexOf(usedFlavorNames, flavor.name) > -1), flavor => {
                    flavor.frequency = this.CLOUD_INSTANCE_CPU_FREQUENCY[flavor.type];
                    flavor.count = _.get(_.find(usedFlavors, f => f.flavor === flavor.name), "count");
                    this.CloudFlavorService.constructor.addPriceInfos(flavor, this.prices);
                    return flavor;
                });
            })
            .catch(this.ServiceHelper.errorHandler("cpciiac_add_step4_flavors_ERROR"))
            .finally(() => {
                this.loaders.flavors = false;
            });
    }

    resetStep4 () {
        this.submitted.step4 = false;
        this.flavors = null;
    }

    addInfrastructureAsCode () {
        this.submitted.step4 = true;
        this.loaders.deploying = true;

        const actions = {};
        _.forEach(_.get(this.model, "stack.commands"), action => {
            if (action.name && action.command) {
                actions[action.name] = action.command;
            }
        });

        const env = _.map(_.cloneDeep(this.model.stack.inputs), input => ({ key: input.key, value: input.value }));
        return this.OvhApiCloudProjectStack.v6().client({ serviceName: this.serviceName, stackId: this.model.stack.uuid }, { env }).$promise
            .then(session => {
                this.$state.go("iaas.pci-project.compute.infrastructure.diagram", {
                    hTerm: {
                        session,
                        actions,
                        region: _.get(this.model, "region.microRegion.code")
                    }
                });
            })
            .catch(this.ServiceHelper.errorHandler("cpciiac_add_deployment_ERROR"))
            .catch(() => {
                this.submitted.step4 = false;
                this.loaders.deploying = false;
            });

    }
}

angular.module("managerApp").controller("CloudProjectComputeInfrastructureIacAddCtrl", CloudProjectComputeInfrastructureIacAddCtrl);
