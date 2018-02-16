class LogsIndexAddModalCtrl {
    constructor ($q, $stateParams, $uibModalInstance, ControllerHelper, indexInfo, options, LogsIndexService) {
        this.$stateParams = $stateParams;
        this.$q = $q;
        this.ControllerHelper = ControllerHelper;
        this.indexInfo = indexInfo;
        this.options = options;
        this.suffixPattern = "^[a-z0-9_-]+$";
        this.LogsIndexService = LogsIndexService;
        this.$uibModalInstance = $uibModalInstance;
        this.serviceName = $stateParams.serviceName;
        this.index = this.LogsIndexService.getNewIndex();
    }

    $onInit () {
        this.isEdit = this.checkIsEdit(this.indexInfo);
        if (this.isEdit) {
            this.populateIndex();
        } else {
            this.clearIndex();
        }
    }

    clearIndex () {
        this.index.description = "";
        this.index.alertNotifyEnabled = false;
        this.index.suffix = "";
        this.index.optionId = null;
    }

    populateIndex () {
        this.index.description = this.indexInfo.description;
        this.index.alertNotifyEnabled = this.indexInfo.alertNotifyEnabled;
    }

    checkIsEdit (indexInfo) {
        return indexInfo !== undefined;
    }

    cancel () {
        this.$uibModalInstance.dismiss();
    }

    saveIndex () {
        if (this.form.$invalid) {
            return this.$q.reject();
        }
        this.saving = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () =>
                this.LogsIndexService.createIndex(this.serviceName, this.index)
                    .then(response => this.$uibModalInstance.close(response))
                    .catch(response => this.$uibModalInstance.dismiss(response))
        });
        return this.saving.load();
    }

    editIndex () {
        if (this.form.$invalid) {
            return this.$q.reject();
        }
        this.saving = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () =>
                this.LogsIndexService.updateIndex(this.serviceName, this.indexInfo.indexId, this.index)
                    .then(response => this.$uibModalInstance.close(response))
                    .catch(response => this.$uibModalInstance.dismiss(response))
        });
        return this.saving.load();
    }
}

angular.module("managerApp").controller("LogsIndexAddModalCtrl", LogsIndexAddModalCtrl);
