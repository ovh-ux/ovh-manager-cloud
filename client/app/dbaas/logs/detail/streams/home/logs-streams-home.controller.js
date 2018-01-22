class LogsStreamsHomeCtrl {
    constructor ($q, $state, $stateParams, LogsStreamsService) {
        this.$q = $q;
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.serviceName = this.$stateParams.serviceName;
        this.LogsStreamsService = LogsStreamsService;
    }

    $onInit () {
        this.init();
    }

    /**
     * initializes streams and quota object by making API call to get data
     *
     * @memberof LogsStreamsHomeCtrl
     */
    init () {
        this.loading = true;
        // get total and used streams
        const quota = this.LogsStreamsService.getQuota(this.serviceName)
            .then(results => {
                this.quota = results;
            });
        // get streams
        const streams = this.LogsStreamsService.getStreams(this.serviceName)
            .then(results => {
                this.streams = results;
            });
        // show loading spinner untill all streams are loaded
        this.$q.all([quota, streams])
            .finally(() => {
                this.loading = false;
            });
    }

    /**
     * takes to options page
     *
     * @memberof LogsStreamsHomeCtrl
     */
    increaseQuota () {
        this.$state.go("dbaas.logs.detail.options", {
            serviceName: this.serviceName
        });
    }

    /**
     * takes to edit stream page
     *
     * @param {any} stream
     * @memberof LogsStreamsHomeCtrl
     */
    edit (stream) {
        this.$state.go("dbaas.logs.detail.streams.edit", {
            serviceName: this.serviceName,
            streamId: stream.streamId
        });
    }

    /**
     * returns template for stream actions drop down
     *
     * @returns
     * @memberof LogsStreamsHomeCtrl
     */
    actionTemplate () {
        return `
            <cui-dropdown-menu>
                <cui-dropdown-menu-button>
                    <ng-include src="'app/ui-components/icons/button-action.html'"></ng-include>
                </cui-dropdown-menu-button>
                <cui-dropdown-menu-body>
                    <div class="oui-action-menu">
                        <div class="oui-action-menu__item oui-action-menu-item">
                            <div class="oui-action-menu-item__icon"></div>
                            <button class="oui-button oui-action-menu-item__label"
                                type="button"
                                data-ng-bind="'common_edit' | translate"
                                data-ng-click="ctrl.edit($row)"></button>
                        </div>
                    </div>
                </cui-dropdown-menu-body>
            </cui-dropdown-menu>`;
    }
}

angular.module("managerApp").controller("LogsStreamsHomeCtrl", LogsStreamsHomeCtrl);
