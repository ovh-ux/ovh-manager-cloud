class LogsHomeCtrl {
    constructor ($q, $scope, $state, $stateParams, $translate, ControllerHelper, LogsHomeService, LogsTokensService, serviceDetails) {
        this.$q = $q;
        this.$scope = $scope;
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.serviceName = this.$stateParams.serviceName;
        this.$translate = $translate;
        this.ControllerHelper = ControllerHelper;
        this.LogsHomeService = LogsHomeService;
        this.LogsTokensService = LogsTokensService;
        this.service = serviceDetails;
        this.initLoaders();
    }

    $onInit () {
        if (this.service.state === this.LogsHomeService.LogsHomeConstant.SERVICE_STATE_TO_CONFIG) {
            this.openSetupAccountModal(true);
        }
        this.runLoaders()
            .then(() => this._initActions());
    }

    /**
     * opens UI modal to change password
     * @param {string} setupPassword
     */
    openSetupAccountModal (setupPassword) {
        this.ControllerHelper.modal.showModal({
            modalConfig: {
                templateUrl: "app/dbaas/logs/detail/account/password/logs-account-password.html",
                controller: "LogsAccountPasswordCtrl",
                controllerAs: "ctrl",
                backdrop: "static",
                resolve: {
                    setupPassword
                }
            }
        }).finally(() => this.ControllerHelper.scrollPageToTop());
    }

    /**
     * initializes the actions for menus
     *
     * @memberof LogsHomeCtrl
     */
    _initActions () {
        this.actions = {
            changeName: {
                text: this.$translate.instant("common_edit"),
                state: "dbaas.logs.detail.home.account",
                stateParams: { serviceName: this.serviceName },
                isAvailable: () => !this.accountDetails.loading && !this.accountDetails.hasErrors
            },
            editTokens: {
                text: this.$translate.instant("common_edit"),
                callback: () => this.editTokens(),
                isAvailable: () => !this.tokenIds.loading && !this.tokenIds.hasErrors
            },
            changePassword: {
                text: this.$translate.instant("common_edit"),
                callback: () => this.editPassword(),
                isAvailable: () => !this.accountDetails.loading && !this.accountDetails.hasErrors
            },
            lastStream: {
                text: this.accountDetails.data.last_stream.info.title,
                href: this.accountDetails.data.last_stream.graylogWebuiUrl,
                isAvailable: () => !this.accountDetails.loading && !this.accountDetails.hasErrors,
                isExternal: true
            },
            allStream: {
                text: this.$translate.instant("logs_home_shortcuts_all_stream"),
                state: "dbaas.logs.detail.streams",
                stateParams: { serviceName: this.serviceName },
                isAvailable: () => true
            },
            lastDashboard: {
                text: this.accountDetails.data.last_dashboard.info.title,
                href: this.accountDetails.data.last_dashboard.graylogWebuiUrl,
                isAvailable: () => !this.accountDetails.loading && !this.accountDetails.hasErrors,
                isExternal: true
            },
            allDashboard: {
                text: this.$translate.instant("logs_home_shortcuts_all_dashboard"),
                state: "dbaas.logs.detail.dashboards",
                stateParams: { serviceName: this.serviceName },
                isAvailable: () => true
            },
            graylog: {
                text: this.$translate.instant("logs_home_shortcuts_graylog"),
                href: this.accountDetails.data.graylogWebuiUrl,
                isAvailable: () => !this.accountDetails.loading && !this.accountDetails.hasErrors,
                isExternal: true
            },
            graylogApi: {
                text: this.$translate.instant("logs_home_shortcuts_graylog_api"),
                href: this.accountDetails.data.graylogApiUrl,
                isAvailable: () => !this.accountDetails.loading && !this.accountDetails.hasErrors,
                isExternal: true
            },
            elasticsearch: {
                text: this.$translate.instant("logs_home_shortcuts_elasticsearch"),
                href: this.accountDetails.data.elasticSearchApiUrl,
                isAvailable: () => !this.accountDetails.loading && !this.accountDetails.hasErrors,
                isExternal: true
            },
            messagesAndPorts: {
                text: this.$translate.instant("logs_home_formats_and_ports"),
                callback: () => this.openMessagesAndPorts(),
                isAvailable: () => !this.accountDetails.loading && !this.accountDetails.hasErrors
            },
            changeOffer: {
                text: this.$translate.instant("common_edit"),
                state: "dbaas.logs.detail.offer",
                stateParams: { serviceName: this.serviceName },
                isAvailable: () => !this.account.loading && !this.account.hasErrors
            },
            editOptions: {
                text: this.$translate.instant("common_edit"),
                state: "dbaas.logs.detail.options",
                stateParams: { serviceName: this.serviceName },
                isAvailable: () => !this.options.loading && !this.options.hasErrors
            }
        };
    }

    /**
     * Redirects to the tokens page
     *
     * @memberof LogsHomeCtrl
     */
    editTokens () {
        this.$state.go("dbaas.logs.detail.tokens", {
            serviceName: this.serviceName
        });
    }

    /**
     * Opens the edit password dialog
     *
     * @memberof LogsHomeCtrl
     */
    editPassword () {
        this.openSetupAccountModal(false);
    }

    /**
     * initializes the loaders
     *
     * @memberof LogsHomeCtrl
     */
    initLoaders () {
        this.accountDetails = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.LogsHomeService.getAccountDetails(this.serviceName)
        });
        this.account = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.LogsHomeService.getAccount(this.serviceName)
        });
        this.options = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.LogsHomeService.getOptions(this.serviceName)
        });
        this.tokenIds = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.LogsTokensService.getTokensIds(this.serviceName)
        });
        this.defaultCluster = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.LogsTokensService.getDefaultCluster(this.serviceName)
        });
        this.serviceInfos = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.LogsHomeService.getServiceInfos(this.serviceName)
        });
    }

    showSetupModal () {
        //
    }

    /**
     * Opens the Messages and Ports information dialog
     *
     * @memberof LogsHomeCtrl
     */
    openMessagesAndPorts () {
        this.ControllerHelper.modal.showModal({
            modalConfig: {
                templateUrl: "app/dbaas/logs/detail/home/formatsports/logs-home-formatsports.html",
                controller: "LogsHomeFormatsportsCtrl",
                controllerAs: "ctrl",
                resolve: {
                    accountDetails: () => this.accountDetails.data
                }
            }
        });
    }

    /**
     * Runs the loaders
     *
     * @memberof LogsHomeCtrl
     */
    runLoaders () {
        const loaderPromises = [];
        loaderPromises.push(this.accountDetails.load());
        loaderPromises.push(this.account.load());
        loaderPromises.push(this.options.load());
        loaderPromises.push(this.tokenIds.load());
        loaderPromises.push(this.defaultCluster.load());
        loaderPromises.push(this.serviceInfos.load());
        return this.$q.all(loaderPromises);
    }
}

angular.module("managerApp").controller("LogsHomeCtrl", LogsHomeCtrl);
