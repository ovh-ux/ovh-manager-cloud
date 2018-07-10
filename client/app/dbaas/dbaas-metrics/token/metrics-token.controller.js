(() => {
    class MetricsTokenCtrl {
        constructor ($scope, $stateParams, $translate, ControllerHelper, MetricService, ovhDocUrl) {
            this.scope = $scope;
            this.$stateParams = $stateParams;
            this.serviceName = $stateParams.serviceName;
            this.$translate = $translate;
            this.ControllerHelper = ControllerHelper;
            this.MetricService = MetricService;
            this.ovhDocUrl = ovhDocUrl;

            this.tokens = [];
            this.loading = false;
        }

        $onInit () {
            this.getTokens(this.serviceName);
        }

        getTokens (serviceName) {
            this.loading = true;
            this.MetricService.getTokens(serviceName)
                .then(data => {
                    this.tokens = data.filter(token => token.isRevoked === false);
                    this.loading = false;
                });
        }

        getGuides () {
            return this.ovhDocUrl.getDocUrl("cloud/metrics");
        }

        onSearchText () {
            this.scope.$broadcast("oui-table:token-table:refresh", {
                searchText: this.searchText
            });
        }

        displayRemainingLabels (number) {
            return `+${number}`;
        }

        labelsTemplate () {
            return `
                <span class="token-labels" data-ng-repeat="label in $row.labels | orderBy : 'key'" data-ng-if="$index < 2">
                    <span data-ng-bind="label.key"></span>:<span data-ng-bind="label.value"></span>
                </span>
                <oui-dropdown data-ng-if="$row.labels.length > 2" data-arrow data-align="end">
                    <div data-oui-dropdown-trigger>
                        <span class="token-labels token-labels__button" data-ng-bind="MetricsTokenCtrl.displayRemainingLabels($row.labels.length - 2)"></span>
                    </div>
                    <oui-dropdown-content>
                        <div class="token-labels-container">
                            <span class="token-labels" data-ng-repeat="label in $row.labels | orderBy : 'key' track by $index" data-ng-if="$index >= 2">
                                <span data-ng-bind="label.key"></span>:<span data-ng-bind="label.value"></span>
                            </span>
                        </div>
                    </oui-dropdown-content>
                </oui-dropdown>
            `;
        }

        actionTemplate () {
            return `
                <oui-action-menu data-align="end" data-compact>
                    <oui-action-menu-item data-text="{{'metrics_token_show_preview' | translate}}"
                                          data-on-click="MetricsTokenCtrl.showPreview($row.id)"></oui-action-menu-item>
                    <oui-action-menu-item data-text="{{'metrics_token_edit' | translate}}"
                                          data-on-click="MetricsTokenCtrl.edit($row.id, $row.description)"></oui-action-menu-item>
                    <oui-action-menu-item data-text="{{'metrics_token_delete' | translate}}"
                                          data-on-click="MetricsTokenCtrl.delete($row.id)"></oui-action-menu-item>
                </oui-action-menu>
            `;
        }

        showPreview (tokenID) {
            this.ControllerHelper.modal.showModal({
                modalConfig: {
                    templateUrl: "app/dbaas/dbaas-metrics/token/preview/metrics-token-preview.html",
                    controller: "MetricsTokenPreviewCtrl",
                    controllerAs: "$ctrl",
                    resolve: {
                        serviceName: () => this.serviceName,
                        tokenID: () => tokenID
                    }
                }
            });
        }

        edit (tokenID, desc) {
            this.ControllerHelper.modal.showModal({
                modalConfig: {
                    templateUrl: "app/dbaas/dbaas-metrics/token/edit/metrics-token-edit.html",
                    controller: "MetricsTokenEditCtrl",
                    controllerAs: "$ctrl",
                    resolve: {
                        metricsType: () => "name",
                        metricsValue: () => desc,
                        serviceName: () => this.serviceName,
                        tokenID: () => tokenID
                    }
                },
                successHandler: () => this.getTokens(this.serviceName)
            });

        }

        delete (tokenID) {
            this.ControllerHelper.modal.showModal({
                modalConfig: {
                    templateUrl: "app/dbaas/dbaas-metrics/token/delete/metrics-token-delete.html",
                    controller: "MetricsTokenDeleteCtrl",
                    controllerAs: "$ctrl",
                    resolve: {
                        serviceName: () => this.serviceName,
                        tokenID: () => tokenID
                    }
                },
                successHandler: () => this.getTokens(this.serviceName)
            });
        }

    }

    angular.module("managerApp").controller("MetricsTokenCtrl", MetricsTokenCtrl);
})();
