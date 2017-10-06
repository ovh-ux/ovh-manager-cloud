class CloudDbBackupEditCtrl {
    constructor ($q, $uibModalInstance, CloudDbBackupService, CloudDbDatabaseService, CloudMessage, ControllerHelper, params) {
        this.$q = $q;
        this.$uibModalInstance = $uibModalInstance;
        this.CloudDbBackupService = CloudDbBackupService;
        this.CloudDbDatabaseService = CloudDbDatabaseService;
        this.CloudMessage = CloudMessage;
        this.ControllerHelper = ControllerHelper;
        this.params = params;

        this.databases = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.CloudDbDatabaseService.getDatabases(this.params.projectId, this.params.instanceId)
        });

        this.model = {
            name: {
                value: null,
                minLength: 3,
                maxLength: Infinity,
                required: true
            },
            database: {
                value: null,
                required: true
            }
        };
    }

    $onInit () {
        this.databases.load();
    }

    add () {
        if (this.form.$invalid) {
            return this.$q.reject();
        }

        this.CloudMessage.flushChildMessage();
        this.saving = true;
        return this.CloudDbBackupService.addBackup(this.params.projectId, this.params.instanceId, this.model.database.value, this.extractModelValues())
            .then(response => this.$uibModalInstance.close(response))
            .catch(response => this.$uibModalInstance.dismiss(response))
            .finally(() => { this.saving = false; });
    }

    cancel () {
        this.$uibModalInstance.dismiss();
    }

    isModalLoading () {
        return this.databases.loading || this.saving;
    }

    extractModelValues () {
        return _.omit(_.mapValues(this.model, modelKey => modelKey.value), "database");
    }
}

angular.module("managerApp").controller("CloudDbBackupEditCtrl", CloudDbBackupEditCtrl);
