class CloudProjectVirtualMachineAddService {
    constructor ($q, $translate, CloudFlavorService, CloudImageService, ControllerModalHelper, OvhApiCloudProject, OvhApiCloudProjectInstance, OvhApiCloudProjectNetworkPrivateSubnet) {
        this.$q = $q;
        this.$translate = $translate;
        this.CloudFlavorService = CloudFlavorService;
        this.CloudImageService = CloudImageService;
        this.ControllerModalHelper = ControllerModalHelper;
        this.OvhApiCloudProject = OvhApiCloudProject;
        this.OvhApiCloudProjectInstance = OvhApiCloudProjectInstance;
        this.OvhApiCloudProjectNetworkPrivateSubnet = OvhApiCloudProjectNetworkPrivateSubnet;
    }

    getAugmentedImages (images) {
        return _.map(_.uniq(images, "id"), this.CloudImageService.augmentImage);
    }

    getAugmentedFlavorsFilteredByType (flavors, type) {
        return _.filter(_.map(_.filter(flavors, {
            available: true,
            osType: type
        }), flavor => this.CloudFlavorService.augmentFlavor(flavor)), {
            diskType: "ssd",
            flex: false
        });
    }

    getFilteredFlavorsByRegion (flavors, regionCode) {
        const filteredFlavors = _.uniq(_.remove(flavors, { region: regionCode }), "name");
        const usedFlavorNames = _.uniq(_.map(filteredFlavors, flavor => flavor.name));
        const notAvailableFlavors = _.filter(flavors, flavor => !_.include(usedFlavorNames, flavor.name));
        const outOfRegionFlavors = _.map(_.uniq(notAvailableFlavors, "name"), flavor => {
            flavor.regions = _.map(_.filter(notAvailableFlavors, f => f.name === flavor.name), "region");
            flavor.disabled = "NOT_AVAILABLE";
            delete flavor.region;
            delete flavor.price;
            return flavor;
        });

        return filteredFlavors.concat(outOfRegionFlavors);
    }

    getFilteredPrivateNetworksByRegion (privateNetworks, regionCode, subNets = []) {
        return _.chain(privateNetworks)
            .filter(network => {
                if (!_.has(subNets, network.id)) {
                    return false;
                }
                return _.some(network.regions, "region", regionCode);
            })
            .sortBy("vlanId")
            .map(network => {
                const pad = Array(5).join("0");
                return _.assign(network, {
                    vlanId: pad.substring(0, pad.length - network.vlanId.toString().length) + network.vlanId
                });
            })
            .value();
    }

    getImageApps (images) {
        return _.uniq(_.forEach(this.CloudImageService.getApps(images), app => {
            app.appName = _.get(app, "name", "")
                .replace(/^[a-z0-9\s]+\ -\ /ig, "")
                .replace(" - deprecated", "");
            delete app.region;
            delete app.id;
        }), "name").sort((image1, image2) => image1.appName < image2.appName ? -1 : image1.appName > image2.appName ? 1 : 0);
    }

    getMostRecentVm (vms) {
        return _.filter(vms, { status: "ACTIVE" }).sort((vm1, vm2) => new Date(vm2.created) - new Date(vm1.created))[0] || null;
    }

    getPrivateNetworksSubNets (serviceName, privateNetworks) {
        let networkIds = [];
        return _.chain(privateNetworks)
            .map(_.property("id"))
            .tap(ids => (networkIds = ids))
            .map(networkId => this.OvhApiCloudProjectNetworkPrivateSubnet.v6().query({ serviceName, networkId }).$promise)
            .thru(promises => { // .mapKeys on a more recent lodash.
                const collection = {};
                _.forEach(promises, (promise, key) => {
                    collection[networkIds[key]] = promise;
                });
                return this.$q.all(collection);
            })
            .value()
            .then(subNets => subNets)
            .catch(() => []);
    }

    getRegionsByImageType (regions, allImages, imageType) {
        if (this.CloudImageService.isSnapshot(imageType)) {
            return _.filter(regions, region => _.get(imageType, "region", "") === region.microRegion.code);
        }

        const filteredImages = _.filter(_.cloneDeep(allImages), {
            distribution: _.get(imageType, "distribution"),
            nameGeneric: _.get(imageType, "nameGeneric"),
            status: "active"
        });
        const filteredRegions = _.uniq(_.map(filteredImages, image => image.region));
        return _.filter(regions, region => _.indexOf(filteredRegions, region.microRegion.code) > -1);
    }

    groupRegionsByDatacenter (regions) {
        const groupedByMacroRegions = _.groupBy(regions, "macroRegion.code");
        const groupedRegions = _.map(groupedByMacroRegions, microRegions => {
            const region = _.cloneDeep(microRegions[0]);
            region.dataCenters = microRegions;
            delete region.microRegion;
            delete region.disabled;
            return region;
        });
        return groupedRegions;
    }

    groupFlavorsByCategory (flavors, flavorsTypes) {
        const categorizedFlavors = [];
        _.forEach(flavorsTypes, flavorType => {
            const category = this.CloudFlavorService.getCategory(flavorType, true);
            const filteredFlavor = _.filter(flavors, { type: flavorType });
            if (filteredFlavor.length > 0) {
                const categoryObject = _.find(categorizedFlavors, { category: category.id });
                if (categoryObject) {
                    categoryObject.flavors = _(categoryObject.flavors).concat(_.filter(flavors, { type: flavorType })).value();
                } else {
                    categorizedFlavors.push({
                        category: category.id,
                        order: category.order,
                        flavors: _.filter(flavors, { type: flavorType })
                    });
                }
            }
        });
        return _.sortBy(categorizedFlavors, "order");
    }

    hasVRack (serviceName) {
        return this.OvhApiCloudProject.v6().vrack({ serviceName }).$promise
            .then(() => true)
            .catch(err => {
                if (_.get(err, "status") === 404) {
                    return false;
                }
                return this.$q.reject(err);
            });
    }

    openSshKeyRegionModal (sshKey) {
        return this.ControllerModalHelper.showConfirmationModal({
            titleText: this.$translate.instant("cpcivm_add_step1_sshKey_regions_title"),
            text: this.$translate.instant("cpcivm_add_step1_sshKey_regions_message", { sshKey })
        });
    }

    openQuotaModal (type, params = null) {
        this.ControllerModalHelper.showWarningModal({
            title: this.$translate.instant(`cpcivm_add_step3_disabled_${type}`),
            message: this.$translate.instant(`cpcivm_add_step3_disabled_message_${type}`, params)
        });
    }

    createVirtualMachine (serviceName, data) {
        const postVm = {
            flavorId: _.get(data, "flavor.id"),
            imageId: _.get(data, "imageId.id"),
            name: _.get(data, "name", "No Name"),
            region: _.get(data, "region.microRegion.code"),
            sshKeyId: _.get(data, "sshKey.id", undefined),
            monthlyBilling: _.get(data, "billingPeriod", "") === "monthly",
            userData: _.get(data, "userData", undefined),
            networks: _.get(data, "networks", undefined)
        };

        if (data.number > 1) {
            postVm.number = data.number;
            return this.OvhApiCloudProjectInstance.v6().bulk({ serviceName }, postVm).$promise;
        }

        return this.OvhApiCloudProjectInstance.v6().save({ serviceName }, postVm).$promise;
    }

    static roundBandwidthValue (value) {
        return Math.floor(value / 50) * 50;
    }
}

angular.module("managerApp").service("CloudProjectVirtualMachineAddService", CloudProjectVirtualMachineAddService);
