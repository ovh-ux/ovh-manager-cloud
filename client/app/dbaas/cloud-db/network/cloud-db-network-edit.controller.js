class CloudDbNetworkEditCtrl {
    constructor ($q, $uibModalInstance, CloudDbNetworkService, CloudMessage, ControllerHelper, params) {
        this.$q = $q;
        this.$uibModalInstance = $uibModalInstance;
        this.CloudDbNetworkService = CloudDbNetworkService;
        this.CloudMessage = CloudMessage;
        this.ControllerHelper = ControllerHelper;

        this.projectId = params.projectId;
        this.instanceId = params.instanceId;
        this.networkId = params.networkId;

        this.model = {
            name: {
                value: "",
                minLength: 3,
                maxLength: Infinity,
                required: true
            },
            network: {
                value: "",
                maxLength: Infinity,
                required: true
            }
        };

        this.network = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.isInEdition() ? this.CloudDbNetworkService.getNetwork(this.projectId, this.instanceId, this.networkId) : this.$q.when({}),
            successHandler: () => {
                this.model.name.value = _.get(this.network, "data.name");
                this.model.network.value = _.get(this.network, "data.network");
            },
            errorHandler: response => this.$uibModalInstance.dismiss(response)
        });
    }

    $onInit () {
        this.network.load();
    }

    add () {
        if (this.form.$invalid) {
            return this.$q.reject();
        }

        this.CloudMessage.flushChildMessage();
        this.saving = true;
        return this.CloudDbNetworkService.addNetwork(this.projectId, this.instanceId, this.extractModelValues())
            .then(response => this.$uibModalInstance.close(response))
            .catch(response => this.$uibModalInstance.dismiss(response))
            .finally(() => { this.saving = false; });
    }

    update () {
        if (this.form.$invalid) {
            return this.$q.reject();
        }

        this.CloudMessage.flushChildMessage();
        this.saving = true;
        return this.CloudDbNetworkService.saveNetwork(this.projectId, this.instanceId, this.networkId, _.omit(this.extractModelValues(), "network"))
            .then(response => this.$uibModalInstance.close(response))
            .catch(response => this.$uibModalInstance.dismiss(response))
            .finally(() => { this.saving = false; });
    }

    cancel () {
        this.$uibModalInstance.dismiss();
    }

    isModalLoading () {
        return this.network.loading || this.saving;
    }

    isInEdition () {
        return this.networkId;
    }

    extractModelValues () {
        return _.mapValues(this.model, modelKey => modelKey.value);
    }
}

angular.module("managerApp").controller("CloudDbNetworkEditCtrl", CloudDbNetworkEditCtrl);
