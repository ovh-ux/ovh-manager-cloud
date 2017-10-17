class CloudDbUserCtrl {
    constructor ($state, $stateParams, $translate, CloudDbActionService, CloudDbInstanceService, CloudDbUserService, ControllerHelper) {
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.$translate = $translate;
        this.CloudDbActionService = CloudDbActionService;
        this.CloudDbInstanceService = CloudDbInstanceService;
        this.CloudDbUserService = CloudDbUserService;
        this.ControllerHelper = ControllerHelper;

        this.projectId = this.$stateParams.projectId;
        this.instanceId = this.$stateParams.instanceId;

        this.instance = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.CloudDbInstanceService.getInstance(this.projectId, this.instanceId, { resetCache: true })
        });

        this.users = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.CloudDbUserService.getUsers(this.projectId, this.instanceId)
        });

        this.actions = {
            addUser: {
                text: this.$translate.instant("cloud_db_user_add"),
                callback: () => this.$state.go("dbaas.cloud-db.instance.detail.user.add", { projectId: this.projectId, instanceId: this.instanceId }),
                isAvailable: () => !this.instance.loading  /*|| this.instance.data.image.capabilities*/ //TODO : put condition on capabilities.  Maybe on task also.
            },
            preview: {
                text: this.$translate.instant("common_preview_see"),
                callback: user => this.CloudDbActionService.showUserPreviewModal(this.projectId, this.instanceId, user),
                isAvailable: () => true
            },
            updateUser: {
                text: this.$translate.instant("common_edit"),
                callback: user => this.$state.go("dbaas.cloud-db.instance.detail.user.update", {
                    projectId: this.$stateParams.projectId,
                    instanceId: this.$stateParams.instanceId,
                    userId: user.name
                }),
                isAvailable: user => !this.instance.loading && !user.taskId /*|| this.instance.data.image.capabilities*/ //TODO : put condition on capabilities.  Maybe on task also.
            },
            deleteUser: {
                text: this.$translate.instant("common_delete"),
                callback: user => this.ControllerHelper.modal.showDeleteModal({
                    titleText: this.$translate.instant("cloud_db_user_delete_title"),
                    text: this.$translate.instant("cloud_db_user_delete_confirmation_message")
                })
                    .then(() => this.CloudDbUserService.deleteUser(this.projectId, this.instanceId, user.name))
                    .then(() => this.$onInit()),
                isAvailable: user => !this.instance.loading && !user.taskId /*|| this.instance.data.image.capabilities*/ //TODO : put condition on capabilities.  Maybe on task also.
            }
        };
    }

    $onInit () {
        this.instance.load();
        this.users.load();
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
                                data-ng-bind="$ctrl.actions.preview.text"
                                data-ng-disabled="!$ctrl.actions.preview.isAvailable($row)"
                                data-ng-click="$ctrl.actions.preview.callback($row)"></button>
                        </div>
                    </div>
                    <div class="oui-action-menu">
                        <div class="oui-action-menu__item oui-action-menu-item">
                            <div class="oui-action-menu-item__icon"></div>
                            <button class="oui-button oui-button_link oui-action-menu-item__label"
                                type="button"
                                data-ng-disabled="!$ctrl.actions.updateUser.isAvailable($row)"
                                data-ng-bind="'common_edit' | translate"
                                data-ng-click="$ctrl.actions.updateUser.callback($row)"></button>
                        </div>
                        <div class="oui-action-menu__item oui-action-menu-item">
                            <div class="oui-action-menu-item__icon"></div>
                            <button class="oui-button oui-button_link oui-action-menu-item__label"
                                type="button"
                                data-ng-bind="'common_delete' | translate"
                                data-ng-disabled="!$ctrl.actions.deleteUser.isAvailable($row)"
                                data-ng-click="$ctrl.actions.deleteUser.callback($row)"></button>
                        </div>
                    </div>
                </cui-dropdown-menu-body>
            </cui-dropdown-menu>`;
    }
}

angular.module("managerApp").controller("CloudDbUserCtrl", CloudDbUserCtrl);
