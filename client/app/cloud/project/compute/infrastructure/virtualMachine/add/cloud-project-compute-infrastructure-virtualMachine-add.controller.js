class CloudProjectComputeInfrastructureVirtualMachineAddCtrl {
    constructor ($q, $state, $stateParams,
                 CloudFlavorService, CloudImageService, CloudProjectVirtualMachineAddService, CloudRegionService,
                 OvhCloudPriceHelper, OvhApiCloudProjectFlavor, OvhApiCloudProjectImage, OvhApiCloudProjectInstance, OvhApiCloudProjectNetworkPrivate,
                 OvhApiCloudProjectNetworkPublic, OvhApiCloudProjectQuota, OvhApiCloudProjectRegion, OvhApiCloudProjectSnapshot, OvhApiCloudProjectSshKey,
                 CurrencyService, RegionService, ServiceHelper, ovhDocUrl) {
        this.$q = $q;
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.CloudFlavorService = CloudFlavorService;
        this.CloudImageService = CloudImageService;
        this.OvhCloudPriceHelper = OvhCloudPriceHelper;
        this.CloudRegionService = CloudRegionService;
        this.OvhApiCloudProjectFlavor = OvhApiCloudProjectFlavor;
        this.OvhApiCloudProjectImage = OvhApiCloudProjectImage;
        this.OvhApiCloudProjectInstance = OvhApiCloudProjectInstance;
        this.OvhApiCloudProjectNetworkPrivate = OvhApiCloudProjectNetworkPrivate;
        this.OvhApiCloudProjectNetworkPublic = OvhApiCloudProjectNetworkPublic;
        this.OvhApiCloudProjectQuota = OvhApiCloudProjectQuota;
        this.OvhApiCloudProjectRegion = OvhApiCloudProjectRegion;
        this.OvhApiCloudProjectSnapshot = OvhApiCloudProjectSnapshot;
        this.OvhApiCloudProjectSshKey = OvhApiCloudProjectSshKey;
        this.CurrencyService = CurrencyService;
        this.RegionService = RegionService;
        this.ServiceHelper = ServiceHelper;
        this.VirtualMachineAddService = CloudProjectVirtualMachineAddService;
        this.ovhDocUrl = ovhDocUrl;
    }

    $onInit () {
        this.serviceName = this.$stateParams.projectId;
        this.currentCurrency = this.CurrencyService.getCurrentCurrency();
        this.loaders = {
            adding: false
        };
        this.model = {
            billingPeriod: null,
            flavor: null,
            imageType: null,
            name: "",
            networkId: "",
            number: 0,
            region: null,
            sshKey: null,
            userData: null
        };
        this.enums = {
            billingPeriods: ["monthly", "hourly"],
            flavorsTypes: [],
            imagesTypes: []
        };
        this.isNameUpdated = false;
        this.isPostScriptEnabled = false;
        this.mostRecentVm = null;
        this.newSshKey = {
            name: null,
            publicKey: null
        };
        this.state = {
            hasVRack: false
        };
        this.submitted = {};
        this.urls = {};
    }

    initProject () {
        this.promisePrices = this.OvhCloudPriceHelper.getPrices(this.serviceName);
        this.promiseQuota = this.OvhApiCloudProjectQuota.v6().query({ serviceName: this.serviceName }).$promise;
        this.promisePublicNetworks = this.OvhApiCloudProjectNetworkPublic.v6().query({ serviceName: this.serviceName }).$promise;
        this.promiseVRack = this.VirtualMachineAddService.hasVRack(this.serviceName);
        this.urls.vLansApiGuide = this.ovhDocUrl.getDocUrl("g2162.public_cloud_et_vrack_-_comment_utiliser_le_vrack_et_les_reseaux_prives_avec_les_instances_public_cloud");
        this.urls.guidesSshkey = this.ovhDocUrl.getDocUrl("g1769.creating_ssh_keys");

        this.initOsList();
    }

    cancel () {
        this.$state.go("iaas.pci-project.compute.infrastructure.list");
    }

    confirm () {
        this.addVirtualMachine();
    }

    /*----------------------------------
     |  Step 1 : OS or SnapShot choice  |
     ----------------------------------*/

    initOsList () {
        this.loaders.step1 = true;
        return this.$q.all({
            images: this.OvhApiCloudProjectImage.v6().query({ serviceName: this.serviceName }).$promise
                .then(images => {
                    // Image types (linux, windows, ...)
                    this.enums.imagesTypes = this.CloudImageService.constructor.getImageTypes(images);
                    this.images = this.VirtualMachineAddService.getAugmentedImages(images);
                })
                .catch(this.ServiceHelper.errorHandler("cpcivm_add_step1_images_ERROR")),
            snapshots: this.OvhApiCloudProjectSnapshot.v6().query({ serviceName: this.serviceName }).$promise
                .then(snapshots => (this.snapshots = _.map(snapshots, snapshot => _.set(snapshot, "distribution", _.get(snapshot, "type", "linux")))))
                .catch(this.ServiceHelper.errorHandler("cpcivm_add_step1_shapshots_ERROR")),
            sshKeys: this.OvhApiCloudProjectSshKey.v6().query({ serviceName: this.serviceName }).$promise,
            instances: this.OvhApiCloudProjectInstance.v6().query({ serviceName: this.serviceName }).$promise
        })
            .then(({ sshKeys, instances }) => {
                this.displayedSnapshots = _.filter(this.snapshots, { status: "active" });
                this.displayedImages = this.CloudImageService.groupImagesByType(this.images, this.enums.imagesTypes);
                this.displayedApps = this.VirtualMachineAddService.getImageApps(this.images);
                this.displayedSshKeys = sshKeys;

                this.mostRecentVm = this.VirtualMachineAddService.getMostRecentVm(instances);
                if (this.mostRecentVm) {
                    this.model.sshKey = _.find(sshKeys, { id: this.mostRecentVm.sshKeyId });
                }
            })
            .catch(this.ServiceHelper.errorHandler("cpcivm_add_step1_general_ERROR"))
            .finally(() => {
                this.loaders.step1 = false;
            });
    }

    isStep1Valid () {
        return this.model.imageType && !this.addingSshKey && (this.model.imageType.type !== "linux" || this.model.sshKey);
    }

    resetStep1 () {
        this.submitted.step1 = false;
        this.resetStep2();
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
                    this.displayedSshKeys = sshKeys;
                    this.model.sshKey = newSshKey;
                    this.checkSshKeyByRegion(newSshKey.regions);
                })
                .catch(this.ServiceHelper.errorHandler("cpcivm_add_step1_sshKey_adding_ERROR"))
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

    /*-----------------------------------------
     |  Step 2 : Region and DataCenter choice  |
     -----------------------------------------*/

    initRegionsAndDataCenters () {
        this.loaders.step2 = true;
        this.submitted.step2 = false;
        this.resetStep3();

        return this.$q.all({
            regions: this.OvhApiCloudProjectRegion.v6().query({ serviceName: this.serviceName }).$promise
                .then(regions => {
                    this.regions = _.map(regions, region => this.RegionService.getRegion(region));
                    return this.VirtualMachineAddService.getRegionsByImageType(this.regions, this.images, _.get(this.model, "imageType"));
                }),
            quota: this.promiseQuota
                .then(quota => (this.quota = quota))
                .catch(this.ServiceHelper.errorHandler("cpcivm_add_step2_quota_ERROR"))
        })
            .then(({ regions }) => {
                _.forEach(regions, region => {
                    // Add quota info
                    this.CloudRegionService.constructor.addOverQuotaInfos(region, this.quota);

                    // Check SSH Key opportunity
                    if (_.get(this.model, "sshKey.regions", false)) {
                        this.CloudRegionService.constructor.checkSshKey(region, this.model.sshKey.regions);
                    }
                });

                this.displayedRegions = this.VirtualMachineAddService.groupRegionsByDatacenter(regions);
                this.groupedRegions = _.groupBy(this.displayedRegions, "continent");
            })
            .catch(this.ServiceHelper.errorHandler("cpcivm_add_step2_regions_ERROR"))
            .finally(() => {
                this.loaders.step2 = false;
            });
    }

    isStep2Valid () {
        return this.model.region && this.model.imageId;
    }

    resetStep2 () {
        this.submitted.step2 = false;
        this.model.region = null;
        this.resetStep3();
    }

    setImageId () {
        if (this.CloudImageService.isSnapshot(this.model.imageType)) {
            this.model.imageId = this.model.imageType;
        } else {
            this.model.imageId = _.find(this.images, {
                apps: _.get(this.model, "imageType.apps", false),
                distribution: this.model.imageType.distribution,
                nameGeneric: this.model.imageType.nameGeneric,
                region: this.model.region.microRegion.code,
                status: "active",
                type: _.get(this.model, "imageType.type", "linux")
            });
        }
    }

    checkSshKeyByRegion (sshKeyRegions) {
        _.forEach(this.displayedRegions, region => {
            _.forEach(region.dataCenters, dataCenter => {
                this.CloudRegionService.constructor.checkSshKey(dataCenter, sshKeyRegions);
            });
        });
    }

    updateSshKeyRegion () {
        return this.VirtualMachineAddService.openSshKeyRegionModal(this.model.sshKey)
            .then(() => {
                this.loaders.step2 = true;
                return this.OvhApiCloudProjectSshKey.v6().remove({
                    serviceName: this.serviceName,
                    keyId: this.model.sshKey.id
                }).$promise;
            })
            .then(() => this.OvhApiCloudProjectSshKey.v6().save({ serviceName: this.serviceName }, {
                name: this.model.sshKey.name,
                publicKey: this.model.sshKey.publicKey
            }).$promise)
            .then(sshKey => {
                this.model.sshKey = sshKey;
                _.set(_.find(this.displayedSshKeys, { id: sshKey.id }), "regions", sshKey.regions);
                this.checkSshKeyByRegion(sshKey.regions);
            })
            .finally(() => {
                this.loaders.step2 = false;
            });
    }

    /*---------------------
     |  Step 3: Instances  |
     ---------------------*/

    initInstances () {
        this.loaders.step3 = true;
        this.submitted.step3 = false;
        this.resetStep4();

        return this.$q.all({
            flavors: this.OvhApiCloudProjectFlavor.v6().query({ serviceName: this.serviceName }).$promise
                .then(flavors => {
                    this.flavors = flavors;
                    const filteredFlavors = this.VirtualMachineAddService.getAugmentedFlavorsFilteredByType(flavors, this.model.imageType.type);
                    this.enums.flavorsTypes = this.CloudFlavorService.constructor.getFlavorTypes(filteredFlavors);
                    return filteredFlavors;
                }),
            hasVRack: this.promiseVRack,
            prices: this.promisePrices
                .then(prices => (this.prices = prices))
                .catch(this.ServiceHelper.errorHandler("cpcivm_add_step3_flavor_prices_ERROR"))
        })
            .then(({ flavors, hasVRack }) => {
                this.state.hasVRack = hasVRack;
                // Load private networks asynchronously
                if (hasVRack) {
                    this.getPrivateNetworks();
                }

                // Add price and quota info to each instance type
                _.forEach(flavors, flavor => {
                    this.CloudFlavorService.constructor.addPriceInfos(flavor, this.prices);
                    this.CloudFlavorService.constructor.addOverQuotaInfos(flavor, this.quota, _.get(this.model, "imageId.minDisk", 0), _.get(this.model, "imageId.minRam", 0));
                });

                // Remove flavor without price (not in the catalog)
                _.remove(flavors, flavor => _.isEmpty(_.get(flavor, "price.price.text", "")));

                let filteredFlavors = this.VirtualMachineAddService.getFilteredFlavorsByRegion(flavors, this.model.region.microRegion.code);

                // Remove flavors if OS has restricted
                const restrictedFlavors = _.get(this.model, "imageId.flavorType") || [];
                if (restrictedFlavors.length > 0) {
                    filteredFlavors = _.filter(filteredFlavors, flavor => _.indexOf(restrictedFlavors, flavor.shortType) > -1);
                }

                // Remove incompatible flavors with selected image
                filteredFlavors = _.filter(filteredFlavors, flavor => {
                    const restrictedImages = _.get(flavor, "imageType", false);
                    return restrictedImages === false || _.some(restrictedImages, name => (new RegExp(name, "gi")).test(this.model.imageType.name));
                });

                this.groupedFlavors = this.VirtualMachineAddService.groupFlavorsByCategory(filteredFlavors, this.enums.flavorsTypes);
            })
            .catch(this.ServiceHelper.errorHandler("cpcivm_add_step3_flavors_ERROR"))
            .finally(() => {
                this.loaders.step3 = false;
            });
    }

    isStep3Valid () {
        return this.model.flavor != null;
    }

    resetStep3 () {
        this.model.flavor = null;
        this.submitted.step3 = false;
        this.resetStep4();
    }

    /*--------------------------
     |  Step 4: Instance config |
     --------------------------*/

    initInstanceConfiguration () {
        this.loaders.step4 = true;
        this.submitted.step4 = false;
        // Set instance creation number to 1 and name
        this.model.number = 1;
        this.setInstanceName();

        return this.promisePublicNetworks
            .then(publicNetworks => (this.publicNetworks = publicNetworks))
            .catch(() => (this.publicNetworks = []))
            .finally(() => {
                this.loaders.step4 = false;
            });
    }

    isStep4Valid () {
        return !_.isEmpty(this.model.name) && this.model.number > 0 && (!this.state.hasVRack || !_.isEmpty(this.model.networkId));
    }

    resetStep4 () {
        this.model.network = null;
        this.model.number = 1;
        if (!this.isNameUpdated) {
            this.model.name = "";
        }
        this.submitted.step4 = false;
        this.resetStep5();
    }

    enablePostScript () {
        this.isPostScriptEnabled = true;
    }

    getPrivateNetworks () {
        this.loaders.privateNetworks = true;
        return this.OvhApiCloudProjectNetworkPrivate.v6().query({ serviceName: this.serviceName }).$promise.then(networks => {
            this.privateNetworks = networks;
            return this.VirtualMachineAddService.getPrivateNetworksSubNets(this.serviceName, this.privateNetworks);
        }).then(subNets => {
            this.displayedPrivateNetworks = this.VirtualMachineAddService.getFilteredPrivateNetworksByRegion(this.privateNetworks, this.model.region.microRegion.code, subNets);
        }).catch(() => {
            this.displayedPrivateNetworks = [];
        }).finally(() => {
            this.loaders.privateNetworks = false;
        });
    }

    setInstanceName () {
        if (_.isEmpty(this.model.name) || !this.isNameUpdated) {
            this.model.name = `${_.get(this.model, "flavor.name", "")}-${_.get(this.model, "region.microRegion.code", "")}`.toLowerCase();
        }
    }

    /*--------------------------
     |  Step 5: Billing period  |
     --------------------------*/

    initBillingPeriod () {
        this.resetStep5();
    }

    isStep5Valid () {
        return _.isString(this.model.billingPeriod) && !_.isEmpty(this.model.billingPeriod);
    }

    resetStep5 () {
        this.model.billingPeriod = null;
        this.submitted.step5 = false;
    }

    /*-------------------
     |  Submit the form  |
     -------------------*/

    addVirtualMachine () {
        this.loaders.adding = true;
        this.submitted.step4 = true;

        if (!_.isEmpty(this.model.networkId) && this.model.networkId !== "none") {
            this.model.networks = [{ networkId: this.model.networkId }, { networkId: _.first(this.publicNetworks).id }];
        }

        return this.VirtualMachineAddService.createVirtualMachine(this.serviceName, this.model)
            .then(() => {
                this.$state.go("iaas.pci-project.compute.infrastructure.list");
            })
            .catch(this.ServiceHelper.errorHandler("cpcivm_add_launch_ERROR"))
            .catch(() => {
                this.submitted.step4 = false;
                this.loaders.adding = false;
            });
    }
}

angular.module("managerApp").controller("CloudProjectComputeInfrastructureVirtualMachineAddCtrl", CloudProjectComputeInfrastructureVirtualMachineAddCtrl);
