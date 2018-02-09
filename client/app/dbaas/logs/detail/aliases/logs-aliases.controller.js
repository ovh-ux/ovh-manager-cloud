class LogsAliasesCtrl {
    constructor ($state, $stateParams, $translate, LogsAliasesService, ControllerHelper, CloudMessage) {
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.serviceName = this.$stateParams.serviceName;
        this.$translate = $translate;
        this.serviceName = this.$stateParams.serviceName;
        this.LogsAliasesService = LogsAliasesService;
        this.ControllerHelper = ControllerHelper;
        this.CloudMessage = CloudMessage;

        this.initLoaders();
    }

    /**
     * initializes aliases and quota object by making API call to get data
     *
     * @memberof LogsAliasesCtrl
     */
    initLoaders () {
        this.quota = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.LogsAliasesService.getQuota(this.serviceName)
        });
        this.aliases = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.LogsAliasesService.getAliases(this.serviceName)
        });
        this.quota.load();
        this.aliases.load();
    }

    /**
     * navigates to edit alias page
     *
     * @param {any} alias
     * @memberof LogsAliasesCtrl
     */
    edit (alias) {
        this.$state.go("dbaas.logs.detail.aliases.edit", {
            serviceName: this.serviceName,
            aliasId: alias.aliasId
        });
    }

    /**
     * show delete alias confirmation modal
     *
     * @param {any} alias to delete
     * @memberof LogsAliasesCtrl
     */
    showDeleteConfirm (alias) {
        this.CloudMessage.flushChildMessage();
        return this.ControllerHelper.modal.showDeleteModal({
            titleText: this.$translate.instant("logs_aliases_delete_title"),
            text: this.$translate.instant("logs_alias_delete_message", { alias: alias.name })
        }).then(() => this.delete(alias));
    }

    /**
     * delete alias
     *
     * @param {any} alias to delete
     * @memberof LogsAliasesCtrl
     */
    delete (alias) {
        this.delete = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () =>
                this.LogsAliasesService.deleteAlias(this.serviceName, alias)
                    .then(() => this.initLoaders())
        });
        this.delete.load();
    }

    getElasticSearchUrl (alias) {
        return this.LogsAliasesService.getElasticSearchUrl(alias);
    }
}

angular.module("managerApp").controller("LogsAliasesCtrl", LogsAliasesCtrl);
