class CloudDbProjectCtrl {
    constructor ($scope, $state, $stateParams, $translate, CloudDbInstanceService, CloudDbProjectService, CloudNavigation, CloudPoll, ControllerHelper, OvhApiCloudDbStdInstance) {
        this.$scope = $scope;
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.$translate = $translate;
        this.CloudDbInstanceService = CloudDbInstanceService;
        this.CloudDbProjectService = CloudDbProjectService;
        this.CloudNavigation = CloudNavigation;
        this.CloudPoll = CloudPoll;
        this.ControllerHelper = ControllerHelper;
        this.OvhApiCloudDbStdInstance = OvhApiCloudDbStdInstance;

        this.projectId = this.$stateParams.projectId;

        this.$scope.$on("$destroy", () => this.stopTaskPolling());

        this.initActions();
        this.initLoaders();
    }

    $onInit () {
        this.instances.load();
        this.configuration.load();
        this.subscription.load();
    }

    initLoaders () {
        this.instances = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.CloudDbInstanceService.getInstances(this.projectId),
            successHandler: () => this.startTaskPolling()
        });

        this.configuration = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.CloudDbProjectService.getConfiguration(this.projectId)
        });

        this.subscription = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.CloudDbProjectService.getSubscription(this.projectId)
        });
    }

    initActions () {
        this.actions = {
            addInstance: {
                text: this.$translate.instant("cloud_db_project_instance_add"),
                state: "dbaas.cloud-db.project.instance-add",
                stateParams: { projectId: this.projectId },
                isAvailable: () => true
            },
            goToInstance: {
                text: this.$translate.instant("common_see_detail"),
                callback: instance => this.$state.go("dbaas.cloud-db.instance.detail.home", { projectId: this.projectId, instanceId: instance.id }),
                isAvailable: instance => !instance.taskId
            },
            rebootInstance: {
                text: this.$translate.instant("common_delete"),
                callback: instance => this.ControllerHelper.modal.showConfirmationModal({
                    titleText: this.$translate.instant("cloud_db_project_instance_reboot_title"),
                    text: this.$translate.instant("cloud_db_project_instance_reboot_confirmation_message"),
                    submitButtonText: this.$translate.instant("cloud_db_project_instance_reboot")
                })
                    .then(() => this.CloudDbInstanceService.rebootInstance(this.projectId, instance.id))
                    .then(() => this.refreshInstance(instance))
                    .then(() => this.startTaskPolling()),
                isAvailable: instance => !instance.taskId
            },
            deleteInstance: {
                text: this.$translate.instant("common_delete"),
                callback: instance => this.ControllerHelper.modal.showDeleteModal({
                    titleText: this.$translate.instant("cloud_db_project_instance_delete_title"),
                    text: this.$translate.instant("cloud_db_project_instance_delete_confirmation_message")
                })
                    .then(() => this.CloudDbInstanceService.deleteInstance(this.projectId, instance.id))
                    .then(() => this.refreshInstance(instance))
                    .then(() => this.startTaskPolling()),
                isAvailable: instance => !instance.taskId
            },
            manageAutorenew: {
                text: this.$translate.instant("common_manage"),
                href: this.ControllerHelper.navigation.getUrl("renew", { projectId: this.projectId, serviceType: "CLOUD_DB" }),
                isAvailable: () => !this.subscription.loading && !this.subscription.hasErrors
            },
            manageContact: {
                text: this.$translate.instant("common_manage"),
                href: this.ControllerHelper.navigation.getUrl("contacts", { projectId: this.projectId }),
                isAvailable: () => !this.subscription.loading && !this.subscription.hasErrors
            }
        };
    }

    startTaskPolling () {
        this.stopTaskPolling();

        const instanceToPoll = _.filter(this.instances.data, instance => instance.taskId && !_.includes(["done", "error"], instance.task.status));
        this.poller = this.CloudPoll.pollArray({
            items: instanceToPoll,
            pollFunction: instance => this.CloudDbInstanceService.getInstance(this.projectId, instance.id, { resetCache: true, muteError: true }),
            stopCondition: instance => !_.get(instance, "task.id") || _.includes(["done", "error"], instance.task.status),
            onItemDone: item => {
                if (!item) {
                    this.instances.load();
                }
            }
        });
    }

    stopTaskPolling () {
        if (this.poller) {
            this.poller.kill();
        }
    }

    refreshInstance (instance) {
        return this.CloudDbInstanceService.getInstance(this.projectId, instance.id, { resetCache: true })
            .then(newInstance => _.merge(instance, newInstance));
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
                                data-ng-bind="$ctrl.actions.goToInstance.text"
                                data-ng-disabled="!$ctrl.actions.goToInstance.isAvailable($row)"
                                data-ng-click="$ctrl.actions.goToInstance.callback($row)"></button>
                        </div>
                        <div class="oui-action-menu__item oui-action-menu-item">
                            <div class="oui-action-menu-item__icon"></div>
                            <button class="oui-button oui-button_link oui-action-menu-item__label"
                                type="button"
                                data-ng-bind="'cloud_db_project_instance_reboot' | translate"
                                data-ng-disabled="!$ctrl.actions.rebootInstance.isAvailable($row)"
                                data-ng-click="$ctrl.actions.rebootInstance.callback($row)"></button>
                        </div>
                        <div class="oui-action-menu__item oui-action-menu-item">
                            <div class="oui-action-menu-item__icon"></div>
                            <button class="oui-button oui-button_link oui-action-menu-item__label"
                                type="button"
                                data-ng-bind="'common_delete' | translate"
                                data-ng-disabled="!$ctrl.actions.deleteInstance.isAvailable($row)"
                                data-ng-click="$ctrl.actions.deleteInstance.callback($row)"></button>
                        </div>
                    </div>
                </cui-dropdown-menu-body>
            </cui-dropdown-menu>`;
    }
}

angular.module("managerApp").controller("CloudDbProjectCtrl", CloudDbProjectCtrl);
