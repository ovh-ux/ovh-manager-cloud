class LogsAliasesAddCtrl {
    constructor ($q, $stateParams, $uibModalInstance, LogsAliasesService, ControllerHelper, CloudMessage) {
        this.$q = $q;
        this.$stateParams = $stateParams;
        this.$uibModalInstance = $uibModalInstance;
        this.serviceName = this.$stateParams.serviceName;
        this.LogsAliasesService = LogsAliasesService;
        this.ControllerHelper = ControllerHelper;
        this.CloudMessage = CloudMessage;
        this.isEdit = false;

        this.initLoaders();
    }

    /**
     * initializes options list
     *
     * @memberof LogsAliasesAddCtrl
     */
    initLoaders () {
        this.options = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.LogsAliasesService.getSubscribedOptions(this.serviceName)
        });
        this.options.load();

        this.mainOffer = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.LogsAliasesService.getMainOffer(this.serviceName)
        });
        this.mainOffer.load();

        if (this.$stateParams.aliasId) {
            this.isEdit = true;
            this.alias = this.ControllerHelper.request.getHashLoader({
                loaderFunction: () => this.LogsAliasesService.getAlias(this.serviceName, this.$stateParams.aliasId)
            });
            this.alias.load();
        } else {
            this.isEdit = false;
            this.alias = this.LogsAliasesService.getNewAlias();
        }

        this.title = this.isEdit ? 'logs_aliases_update_title' : 'logs_aliases_add';
    }

    save () {
        if (this.isEdit) {
            return this.updateAlias();
        } else { return this.createAlias(); }
    }

    /**
     * update alias
     *
     * @memberof LogsAliasesAddCtrl
     */
    updateAlias () {
        if (this.form.$invalid) {
            return this.$q.reject();
        }
        this.CloudMessage.flushChildMessage();
        this.saving = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () =>
                this.LogsAliasesService.updateAlias(this.$stateParams.serviceName, this.alias.data)
                    .finally(() => {
                        this.$uibModalInstance.close();
                        this.ControllerHelper.scrollPageToTop();
                    })
        });
        return this.saving.load();
    }

    /**
     * create new alias
     *
     * @memberof LogsAliasesAddCtrl
     */
    createAlias () {
        if (this.form.$invalid) {
            return this.$q.reject();
        }
        this.CloudMessage.flushChildMessage();
        this.saving = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () =>
                this.LogsAliasesService.createAlias(this.$stateParams.serviceName, this.alias.data)
                    .finally(() => {
                        this.$uibModalInstance.close();
                        this.ControllerHelper.scrollPageToTop();
                    })
        });
        return this.saving.load();
    }

    cancel () {
        this.$uibModalInstance.dismiss();
    }
}

angular.module("managerApp").controller("LogsAliasesAddCtrl", LogsAliasesAddCtrl);
