class CloudDbNetworkCtrl {
    constructor ($scope, $stateParams, $translate, CloudDbActionService, CloudDbNetworkService, CloudPoll, ControllerHelper) {
        this.$scope = $scope;
        this.$stateParams = $stateParams;
        this.$translate = $translate;
        this.CloudDbActionService = CloudDbActionService;
        this.CloudDbNetworkService = CloudDbNetworkService;
        this.CloudPoll = CloudPoll;
        this.ControllerHelper = ControllerHelper;

        this.projectId = this.$stateParams.projectId;
        this.instanceId = this.$stateParams.instanceId;

        this.$scope.$on("$destroy", () => this.stopTaskPolling());

        this.networks = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.CloudDbNetworkService.getNetworks(this.projectId, this.instanceId),
            successHandler: () => this.startTaskPolling()
        });

        this.initActions();
    }

    $onInit () {
        this.networks.load();
    }

    initActions () {
        this.actions = {
            addNetwork: {
                text: this.$translate.instant("cloud_db_network_add"),
                callback: () => this.CloudDbActionService.showNetworkEditModal(this.projectId, this.instanceId)
                    .then(() => this.networks.load()),
                isAvailable: () => true
            },
            updateNetwork: {
                text: this.$translate.instant("common_edit"),
                callback: network => this.CloudDbActionService.showNetworkEditModal(this.projectId, this.instanceId, network.network)
                    .then(() => this.refreshNetwork(network))
                    .then(() => this.startTaskPolling()),
                isAvailable: network => !network.taskId
            },
            deleteNetwork: {
                text: this.$translate.instant("common_delete"),
                callback: network => this.ControllerHelper.modal.showDeleteModal({
                    titleText: this.$translate.instant("cloud_db_network_delete_title"),
                    text: this.$translate.instant("cloud_db_network_delete_confirmation_message")
                })
                    .then(() => this.CloudDbNetworkService.deleteNetwork(this.projectId, this.instanceId, network.network))
                    .then(() => this.refreshNetwork(network))
                    .then(() => this.startTaskPolling()),
                isAvailable: network => !network.taskId
            }
        };
    }

    startTaskPolling () {
        this.stopTaskPolling();

        const networkToPoll = _.filter(this.networks.data, network => network.taskId && !_.includes(["done", "error"], network.task.status));
        this.poller = this.CloudPoll.pollArray({
            items: networkToPoll,
            pollFunction: network => this.CloudDbNetworkService.getNetwork(this.projectId, this.instanceId, network.network, { resetCache: true, muteError: true }),
            stopCondition: network => !_.get(network, "task.id") || _.includes(["done", "error"], network.task.status),
            onItemDone: item => {
                if (!item) {
                    this.networks.load();
                }
            }
        });
    }

    stopTaskPolling () {
        if (this.poller) {
            this.poller.kill();
        }
    }

    refreshNetwork (network) {
        return this.CloudDbNetworkService.getNetwork(this.projectId, this.instanceId, network.network, { resetCache: true })
            .then(newNetwork => _.merge(network, newNetwork));
    }

    getActionTemplate () {
        return `
            <cui-dropdown-menu>
                <cui-dropdown-menu-button>
                    <ng-include src="'app/ui-components/icons/button-action.html'"></ng-include>
                </cui-dropdown-menu-button>
                <cui-dropdown-menu-body>
                    <div class="oui-action-menu">
                        <div class="oui-action-menu__item oui-action-menu-item">
                            <div class="oui-action-menu-item__icon"></div>
                            <button class="oui-button oui-button_link oui-action-menu-item__label"
                                type="button"
                                data-ng-disabled="!$ctrl.actions.updateNetwork.isAvailable($row)"
                                data-ng-bind="'common_edit' | translate"
                                data-ng-click="$ctrl.actions.updateNetwork.callback($row)"></button>
                        </div>
                        <div class="oui-action-menu__item oui-action-menu-item">
                            <div class="oui-action-menu-item__icon"></div>
                            <button class="oui-button oui-button_link oui-action-menu-item__label"
                                type="button"
                                data-ng-bind="'common_delete' | translate"
                                data-ng-disabled="!$ctrl.actions.deleteNetwork.isAvailable($row)"
                                data-ng-click="$ctrl.actions.deleteNetwork.callback($row)"></button>
                        </div>
                    </div>
                </cui-dropdown-menu-body>
            </cui-dropdown-menu>`;
    }
}

angular.module("managerApp").controller("CloudDbNetworkCtrl", CloudDbNetworkCtrl);
