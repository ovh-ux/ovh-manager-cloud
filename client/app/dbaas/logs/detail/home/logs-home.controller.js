class LogsHomeCtrl {
    constructor ($q, $scope, $state, $stateParams, $translate, bytesFilter, ControllerHelper, LogsHomeService, LogsTokensService, serviceDetails) {
        this.$q = $q;
        this.$scope = $scope;
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.serviceName = this.$stateParams.serviceName;
        this.$translate = $translate;
        this.bytesFilter = bytesFilter;
        this.ControllerHelper = ControllerHelper;
        this.LogsHomeService = LogsHomeService;
        this.LogsTokensService = LogsTokensService;
        this.service = serviceDetails;
        this.initLoaders();
    }

    $onInit () {
        this.dataUsageGraphData = {};
        if (this.service.state === this.LogsHomeService.LogsHomeConstant.SERVICE_STATE_TO_CONFIG) {
            this.openSetupAccountModal(true);
        }
        this.runLoaders()
            .then(() => this._initActions())
            .then(() => this._prepareDataUsageGraphData());
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

    _prepareDataUsageGraphData () {
        this.dataUsageGraphData.labels = this.storageData.data.timestamps.map(timestamp => moment(timestamp).format("DD MMM"));
        this.dataUsageGraphData.data = this.storageData.data.usageData;
        this.dataUsageGraphData.series = [this.$translate.instant("logs_home_data_received"), this.$translate.instant("logs_home_number_of_documents")];
        this.dataUsageGraphData.options = {
            scales: {
                xAxes: [{
                    gridLines: {
                        display: false
                    }
                }],
                yAxes: [
                    {
                        id: "y-axis-1",
                        type: "linear",
                        display: true,
                        position: "left",
                        ticks: {
                            suggestedMin: 0,
                            suggestedMax: _.max(this.dataUsageGraphData.data[0]) * 1.3 || 5,
                            callback: value => value % 1 === 0 ? this.bytesFilter(value, 2, true) : ""
                        }
                    },
                    {
                        id: "y-axis-2",
                        type: "linear",
                        display: true,
                        position: "right",
                        ticks: {
                            suggestedMin: 0,
                            suggestedMax: _.max(this.dataUsageGraphData.data[1]) * 1.3 || 5,
                            callback: value => value % 1 === 0 ? value : ""
                        }
                    }
                ]
            },
            legend: {
                display: true,
                position: "bottom",
                labels: {
                    fontStyle: "bold"
                }
            }
        };
        this.dataUsageGraphData.colors = [
            {
                backgroundColor: "rgba(89,210,239, 0.4)",
                pointBackgroundColor: "transparent",
                pointHoverBackgroundColor: "#59d2ef",
                borderColor: "#59d2ef",
                pointBorderColor: "transparent",
                pointHoverBorderColor: "#fff"
            }, {
                backgroundColor: "transparent",
                pointBackgroundColor: "transparent",
                pointHoverBackgroundColor: "#113f6d",
                borderColor: "#113f6d",
                pointBorderColor: "transparent",
                pointHoverBorderColor: "#fff"
            }
        ];
        this.dataUsageGraphData.datasetOverride = [{ yAxisID: "y-axis-1" }, { yAxisID: "y-axis-2" }];
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
        this.storageData = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.LogsHomeService.getDataUsage(this.serviceName)
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
        loaderPromises.push(this.storageData.load());
        return this.$q.all(loaderPromises);
    }
}

angular.module("managerApp").controller("LogsHomeCtrl", LogsHomeCtrl);
