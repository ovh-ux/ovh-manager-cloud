class CloudDbInstanceAddCtrl {
    constructor ($stateParams, CloudDbFlavorService, CloudDbImageService, CloudDbInstanceService, CloudDbRegionService, CloudMessage, CloudNavigation, ControllerHelper) {
        this.CloudDbFlavorService = CloudDbFlavorService;
        this.CloudDbImageService = CloudDbImageService;
        this.CloudDbInstanceService = CloudDbInstanceService;
        this.CloudDbRegionService = CloudDbRegionService;
        this.CloudNavigation = CloudNavigation;
        this.CloudMessage = CloudMessage;
        this.ControllerHelper = ControllerHelper;

        this.projectId = $stateParams.projectId;

        this.regions = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.CloudDbRegionService.getRegions(this.projectId)
        });

        this.images = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.CloudDbImageService.getImages(this.projectId)
        });

        this.flavors = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.CloudDbFlavorService.getFlavors(this.projectId)
        });
    }

    $onInit () {
        this.previousState = this.CloudNavigation.getPreviousState();
        this.initModel();
        this.regions.load();
        this.images.load();
        this.flavors.load();
    }

    initModel () {
        this.model = {
            regionName: {
                value: null,
                required: true
            },
            flavorName: {
                value: null,
                required: true
            },
            imageName: {
                value: null,
                required: true
            },
            name: {
                value: null,
                required: true,
                minLength: 0,
                maxLength: Infinity
            }
        };
    }

    add () {
        if (this.form.$invalid) {
            return this.$q.reject();
        }

        this.CloudMessage.flushChildMessage();
        this.saving = true;
        return this.CloudDbInstanceService.addInstance(this.projectId, this.extractModelValues())
            .then(() => {
                this.previousState.go();
            })
            .finally(() => { this.saving = false; });
    }

    onRegionChange () {
        const selectedFlavor = this.getSelectedFlavor() || {};

        if (!this.model.regionName.value || !_.includes(selectedFlavor.supportedRegionNames, this.model.regionName.value)) {
            this.model.flavorName.value = null;
            this.model.imageName.value = null;
        }
    }

    onImageChange () {
        if (!this.model.imageName.value) {
            this.model.flavorName.value = null;
        }
    }

    getSelectableRegions () {
        return _.filter(this.regions.data, region => {
            const flavorRegions = _.flatten(_.map(this.flavors.data, flavor => flavor.supportedRegionNames));
            return _.includes(flavorRegions, region.name);
        });
    }

    getSelectableFlavors () {
        return _.filter(this.flavors.data, flavor => {
            const imageFlavors = _.flatten(_.map(this.images.data, image => image.supportedFlavorNames));

            return _.includes(flavor.supportedRegionNames, this.model.regionName.value) &&
                _.includes(imageFlavors, flavor.name);
        });
    }

    getSelectableImages () {
        return _.filter(this.images.data, image => {
            return _.includes(image.supportedFlavorNames, this.model.flavorName.value);
        });
    }

    getSelectedFlavor () {
        return _.find(this.flavors.data, flavor => flavor.name === this.model.flavorName.value);
    }

    getSelectedImage () {
        return _.find(this.images.data, image => image.name === this.model.imageName.value);
    }

    extractModelValues () {
        return _.mapValues(this.model, modelKey => modelKey.value);
    }

    isLoading () {
        return this.regions.loading || this.flavors.loading || this.images.loading;
    }
}

angular.module("managerApp").controller("CloudDbInstanceAddCtrl", CloudDbInstanceAddCtrl);
