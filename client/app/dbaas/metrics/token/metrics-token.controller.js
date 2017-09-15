(() => {
    class MetricsTokenCtrl {
        constructor ($scope, $stateParams, $translate, ControllerHelper, MetricService) {
            this.scope = $scope;
            this.$stateParams = $stateParams;
            this.serviceName = $stateParams.serviceName;
            this.$translate = $translate;
            this.ControllerHelper = ControllerHelper;
            this.MetricService = MetricService;

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
                <cui-dropdown-menu data-ng-if="$row.labels.length > 2">
                    <cui-dropdown-menu-button>
                        <div class="token-labels__button-container">
                            <span class="token-labels token-labels__button" data-ng-bind="MetricsTokenCtrl.displayRemainingLabels($row.labels.length - 2)"></span>
                        </div>
                    </cui-dropdown-menu-button>
                    <cui-dropdown-menu-body class="token-labels-container">
                        <span class="token-labels" data-ng-repeat="label in $row.labels | orderBy : 'key'" data-ng-if="$index >= 2">
                            <span data-ng-bind="label.key"></span>:<span data-ng-bind="label.value"></span>
                        </span>
                    </cui-dropdown-menu-body>
                </cui-dropdown-menu>
            `;
        }
        
        actionTemplate () {
            return `
                <cui-dropdown-menu>
                    <cui-dropdown-menu-button>
                        <ng-include src="'app/ui-components/icons/button-action.html'"></ng-include>
                    </cui-dropdown-menu-button>
                    <cui-dropdown-menu-body>
                        <div class="oui-action-menu">
                            <div class="oui-action-menu__item oui-action-menu-item">
                                <div class="oui-action-menu-item__icon">
                                    <i class="oui-icon oui-icon-eye" aria-hidden="true"></i>
                                </div>
                                <button class="oui-button oui-button_link oui-action-menu-item__label"
                                    type="button"
                                    data-translate="metrics_token_show_preview"
                                    data-ng-click="MetricsTokenCtrl.showPreview($row.id)"></button>
                            </div>
                        </div>
                        <div class="oui-action-menu">
                            <div class="oui-action-menu__item oui-action-menu-item">
                                <div class="oui-action-menu-item__icon">
                                    <i class="oui-icon oui-icon-pen_line" aria-hidden="true"></i>
                                </div>
                                <button class="oui-button oui-button_link oui-action-menu-item__label"
                                    type="button"
                                    data-translate="metrics_token_edit"
                                    data-ng-click="MetricsTokenCtrl.edit($row.id, $row.description)"></button>
                            </div>
                            <div class="oui-action-menu__item oui-action-menu-item">
                                <div class="oui-action-menu-item__icon">
                                    <i class="oui-icon oui-icon-trash_line" aria-hidden="true"></i>
                                </div>
                                <button class="oui-button oui-button_link oui-action-menu-item__label"
                                    type="button"
                                    data-translate="metrics_token_delete"
                                    data-ng-click="MetricsTokenCtrl.delete($row.id)"></button>
                            </div>
                        </div>
                    </cui-dropdown-menu-body>
                </cui-dropdown-menu>
            `;
        }

        showPreview (tokenID) {
            this.ControllerHelper.modal.showModal({
                modalConfig: {
                    templateUrl: "app/dbaas/metrics/token/preview/metrics-token-preview.html",
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
                    templateUrl: "app/dbaas/metrics/token/edit/metrics-token-edit.html",
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
                    templateUrl: "app/dbaas/metrics/token/delete/metrics-token-delete.html",
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
