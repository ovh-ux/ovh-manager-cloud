class LogsHomeCtrl {
    constructor ($q, $scope, $state, $stateParams, $translate, bytesFilter, ControllerHelper, LogsHomeConstant, LogsHomeService, LogsTokensService, LogsHelperService, LogsDetailService, LogsConstants) {
        this.$q = $q;
        this.$scope = $scope;
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.serviceName = this.$stateParams.serviceName;
        this.$translate = $translate;
        this.bytesFilter = bytesFilter;
        this.ControllerHelper = ControllerHelper;
        this.LogsHomeConstant = LogsHomeConstant;
        this.LogsHomeService = LogsHomeService;
        this.LogsTokensService = LogsTokensService;
        this.LogsHelperService = LogsHelperService;
        this.LogsDetailService = LogsDetailService;
        this.LogsConstants = LogsConstants;
    }

    $onInit () {
        this.service = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.LogsDetailService.getServiceDetails(this.serviceName)
                .then(service => {
                    this.initLoaders();
                    this.isAccountDisabled = this.LogsHelperService.isAccountDisabled(service);
                    this.lastUpdatedDate = moment(service.updatedAt).format("LL");
                    if (service.state === this.LogsConstants.SERVICE_STATE_TO_CONFIG) {
                        this.goToAccountSetupPage();
                    } else {
                        this.dataUsageGraphData = this.LogsHomeConstant.DATA_USAGE_GRAPH_CONFIGURATION;
                        this.runLoaders()
                            .then(() => this._initActions())
                            .then(() => this._prepareDataUsageGraphData());
                    }
                    return service;
                })
        });
        this.service.load();
    }

    goToAccountSetupPage () {
        this.$state.go("dbaas.logs.detail.setup", {
            serviceName: this.serviceName
        });
    }

    /**
     * opens UI modal to change password
     *
     * @memberof LogsHomeCtrl
     */
    openChangePasswordModal () {
        this.ControllerHelper.modal.showModal({
            modalConfig: {
                templateUrl: "app/dbaas/logs/detail/account/password/logs-account-password.html",
                controller: "LogsAccountPasswordCtrl",
                controllerAs: "ctrl",
                backdrop: "static"
            }
        }).finally(() => this.ControllerHelper.scrollPageToTop());
    }

    /**
     * Prepares the data usage graph
     *
     * @memberof LogsHomeCtrl
     */
    _prepareDataUsageGraphData () {
        this.dataUsageGraphData.labels = this.storageData.data.timestamps.map(timestamp => moment(timestamp).format("DD MMM"));
        this.dataUsageGraphData.data = this.storageData.data.usageData;
        this.dataUsageGraphData.series = [this.$translate.instant("logs_home_data_received"), this.$translate.instant("logs_home_number_of_documents")];

        this.dataUsageGraphData.options.scales.yAxes[0].ticks = {
            suggestedMin: 0,
            suggestedMax: _.max(this.dataUsageGraphData.data[0]) * 1.3 || 5,
            callback: value => value % 1 === 0 ? this.bytesFilter(value, 2, true) : ""
        };
        this.dataUsageGraphData.options.scales.yAxes[1].ticks = {
            suggestedMin: 0,
            suggestedMax: _.max(this.dataUsageGraphData.data[1]) * 1.3 || 5,
            callback: value => value % 1 === 0 ? value : ""
        };

        this.dataUsageGraphData.options.tooltips.callbacks = {
            label: (tooltipItem, data) => {
                let label = data.datasets[tooltipItem.datasetIndex].label || "";
                if (label) {
                    label += ": ";
                }
                label += tooltipItem.datasetIndex === 0 ? this.bytesFilter(tooltipItem.yLabel, 2, true) : this.LogsHomeService.humanizeNumber(tooltipItem.yLabel);
                return label;
            }
        };
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
                text: this.accountDetails.data.last_stream ? this.accountDetails.data.last_stream.info.title : "",
                href: this.accountDetails.data.last_stream ? this.accountDetails.data.last_stream.graylogWebuiUrl : "",
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
                text: this.accountDetails.data.last_dashboard ? this.accountDetails.data.last_dashboard.info.title : "",
                href: this.accountDetails.data.last_dashboard ? this.accountDetails.data.last_dashboard.graylogWebuiUrl : "",
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
                isAvailable: () => !this.account.loading && !this.account.hasErrors && !this.isAccountDisabled
            },
            editOptions: {
                text: this.$translate.instant("common_edit"),
                callback: () => this.goToOptionsPage(),
                isAvailable: () => !this.options.loading && !this.options.hasErrors && !this.isAccountDisabled
            }
        };
    }

    /**
     * takes to options UI page if account is pro else shows offer upgrade required modal
     */
    goToOptionsPage () {
        if (this.LogsHelperService.isBasicOffer(this.account.data)) {
            this.LogsHelperService.showOfferUpgradeModal(this.serviceName);
        } else {
            this.$state.go("dbaas.logs.detail.options", {
                serviceName: this.serviceName
            });
        }
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
        this.openChangePasswordModal();
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
        this.serviceInfos = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.LogsHomeService.getServiceInfos(this.serviceName)
        });
        if (!this.isAccountDisabled) {
            this.tokenIds = this.ControllerHelper.request.getArrayLoader({
                loaderFunction: () => this.LogsTokensService.getTokensIds(this.serviceName)
            });
            this.defaultCluster = this.ControllerHelper.request.getHashLoader({
                loaderFunction: () => this.LogsTokensService.getDefaultCluster(this.serviceName)
            });
            this.storageData = this.ControllerHelper.request.getHashLoader({
                loaderFunction: () => this.LogsHomeService.getDataUsage(this.serviceName)
            });
            this.coldStorage = this.ControllerHelper.request.getHashLoader({
                loaderFunction: () => this.LogsHomeService.getColdstorage(this.serviceName)
            });
        }
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
        loaderPromises.push(this.serviceInfos.load());
        if (!this.isAccountDisabled) {
            loaderPromises.push(this.tokenIds.load());
            loaderPromises.push(this.defaultCluster.load());
            loaderPromises.push(this.storageData.load());
            loaderPromises.push(this.coldStorage.load());
        }
        return this.$q.all(loaderPromises);
    }
}

angular.module("managerApp").controller("LogsHomeCtrl", LogsHomeCtrl);
