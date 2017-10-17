class CloudDbAdvancedParameterEditCtrl {
    constructor ($stateParams, CloudDbAdvancedParameterService, CloudDbProjectService, CloudMessage, CloudNavigation, ControllerHelper) {
        this.CloudDbAdvancedParameterService = CloudDbAdvancedParameterService;
        this.CloudMessage = CloudMessage;
        this.CloudNavigation = CloudNavigation;
        this.ControllerHelper = ControllerHelper;

        this.projectId = $stateParams.projectId;
        this.instanceId = $stateParams.instanceId;

        this.initialValues = {};
        this.model = {};

        this.parameters = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.CloudDbAdvancedParameterService.getCurrentParameters(this.projectId, this.instanceId),
            successHandler: () => this.buildModel()
        });
    }

    $onInit () {
        this.parameters.load();

        this.previousState = this.CloudNavigation.getPreviousState();
    }

    update () {
        const parameters = [];
        _.forEach(_.keys(this.model), key => {
            if (this.model[key] !== this.initialValues[key]) {
                parameters.push({ key, value: this.model[key] });
            }
        });

        this.CloudMessage.flushChildMessage();
        this.saving = true;
        this.CloudDbAdvancedParameterService.updateCurrentParameters(this.projectId, this.instanceId, { parameters })
            .then(() => this.previousState.go())
            .finally(() => { this.saving = false; });
    }

    restoreDefaultParameters () {
        _.forEach(_.keys(this.model), key => {
            this.model[key] = _.find(this.parameters.data.details, parameter => parameter.key === key).defaultValue;
        });
    }

    canRestoreDefaultParameters () {
        return _.find(this.parameters.data.details, parameter => parameter.defaultValue !== this.model[parameter.key]);
    }

    buildModel () {
        _.forEach(this.parameters.data.details, param => {
            this.model[param.key] = param.value;
        });
        this.initialValues = _.clone(this.model);
    }
}

angular.module("managerApp").controller("CloudDbAdvancedParameterEditCtrl", CloudDbAdvancedParameterEditCtrl);
