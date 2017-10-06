class CloudDbDatabaseCtrl {
    constructor ($state, $stateParams, $translate, CloudDbActionService, CloudDbDatabaseService, ControllerHelper) {
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.$translate = $translate;
        this.CloudDbActionService = CloudDbActionService;
        this.CloudDbDatabaseService = CloudDbDatabaseService;
        this.ControllerHelper = ControllerHelper;

        this.projectId = this.$stateParams.projectId;
        this.instanceId = this.$stateParams.instanceId;

        this.databases = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.CloudDbDatabaseService.getDatabases(this.projectId, this.instanceId)
        });

        this.actions = {
            addDatabase: {
                text: this.$translate.instant("cloud_db_database_add"),
                state: "dbaas.cloud-db.instance.detail.database.add",
                stateParams: { projectId: this.projectId, instanceId: this.instanceId },
                isAvailable: () => true
            },
            preview: {
                text: this.$translate.instant("common_preview_see"),
                callback: database => this.CloudDbActionService.showDatabasePreviewModal(this.projectId, this.instanceId, database),
                isAvailable: () => true
            },
            updateDatabase: {
                text: this.$translate.instant("common_edit"),
                callback: database => this.$state.go("dbaas.cloud-db.instance.detail.database.update", {
                    projectId: this.projectId,
                    instanceId: this.instanceId,
                    databaseId: database.name
                }),
                isAvailable: () => true
            },
            deleteDatabase: {
                text: this.$translate.instant("common_delete"),
                callback: database => this.ControllerHelper.modal.showDeleteModal({
                    titleText: this.$translate.instant("cloud_db_database_delete_title"),
                    text: this.$translate.instant("cloud_db_database_delete_confirmation_message")
                })
                    .then(() => this.CloudDbDatabaseService.deleteDatabase(this.projectId, this.instanceId, database.name))
                    .then(() => this.databases.load()),
                isAvailable: () => true
            }
        };
    }

    $onInit () {
        this.databases.load();
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
                                data-ng-disabled="!$ctrl.actions.preview.isAvailable()"
                                data-ng-click="$ctrl.actions.preview.callback($row)"></button>
                        </div>
                    </div>
                    <div class="oui-action-menu">
                        <div class="oui-action-menu__item oui-action-menu-item">
                            <div class="oui-action-menu-item__icon"></div>
                            <button class="oui-button oui-button_link oui-action-menu-item__label"
                                type="button"
                                data-ng-disabled="!$ctrl.actions.updateDatabase.isAvailable()"
                                data-ng-bind="'common_edit' | translate"
                                data-ng-click="$ctrl.actions.updateDatabase.callback($row)"></button>
                        </div>
                        <div class="oui-action-menu__item oui-action-menu-item">
                            <div class="oui-action-menu-item__icon"></div>
                            <button class="oui-button oui-button_link oui-action-menu-item__label"
                                type="button"
                                data-ng-bind="'common_delete' | translate"
                                data-ng-disabled="!$ctrl.actions.deleteDatabase.isAvailable()"
                                data-ng-click="$ctrl.actions.deleteDatabase.callback($row)"></button>
                        </div>
                    </div>
                </cui-dropdown-menu-body>
            </cui-dropdown-menu>`;
    }
}

angular.module("managerApp").controller("CloudDbDatabaseCtrl", CloudDbDatabaseCtrl);
