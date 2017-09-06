class IpLoadBalancerServerFarmCtrl {
    constructor ($filter, $state, $stateParams, $translate, ControllerHelper,
                 IpLoadBalancerActionService, IpLoadBalancerServerService,
                 IpLoadBalancerServerFarmService) {
        this.$filter = $filter;
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.$translate = $translate;
        this.ControllerHelper = ControllerHelper;
        this.IpLoadBalancerActionService = IpLoadBalancerActionService;
        this.IpLoadBalancerServerService = IpLoadBalancerServerService;
        this.IpLoadBalancerServerFarmService = IpLoadBalancerServerFarmService;

        this.serviceName = this.$stateParams.serviceName;

        this.initLoaders();
    }

    $onInit () {
        this.i18n = {
            preview: this.$translate.instant("common_preview_see"),
            update: this.$translate.instant("common_modify"),
            remove: this.$translate.instant("delete")
        };

        this.init();
    }

    init () {
        this.farms.load();
    }

    initLoaders () {
        this.farms = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.IpLoadBalancerServerFarmService.getServerFarms(this.serviceName)
                .then(farms => {
                    this.createFarmActions(farms);
                    return farms;
                }),
            successHandler: () => this.loadServers()
        });
    }

    addServer (farm) {
        this.$state.go("network.iplb.detail.server-farm.server-add", {
            farmId: farm.id
        });
    }

    loadServers () {
        _.forEach(this.farms.data, farm => {
            farm.servers = this.ControllerHelper.request.getArrayLoader({
                loaderFunction: () => this.IpLoadBalancerServerFarmService.getServerFarmServers(this.serviceName, farm.farmId, farm.type)
            });
            farm.servers.load();
        });
    }

    seeServerPreview (server) {
        this.ControllerHelper.modal.showModal({
            modalConfig: {
                templateUrl: "app/iplb/server/preview/iplb-server-preview.html",
                controller: "IpLoadBalancerServerPreviewCtrl",
                controllerAs: "IpLoadBalancerServerPreviewCtrl",
                resolve: {
                    server: () => server
                }
            }
        });
    }

    seeServerStatus (server) {
        this.ControllerHelper.modal.showModal({
            modalConfig: {
                templateUrl: "app/iplb/server/status/iplb-server-status-detail.html",
                controller: "IpLoadBalancerServerStatusDetailCtrl",
                controllerAs: "IpLoadBalancerServerStatusDetailCtrl",
                resolve: {
                    server: () => server
                }
            }
        });
    }

    updateServer (server) {
        //  TODO : Do something.
    }

    deleteServer (farm, server) {
        this.IpLoadBalancerActionService.deleteServer(
            this.$stateParams.serviceName,
            farm,
            server
        ).then(() => this.init());
    }

    farmPreview (farm) {
        this.ControllerHelper.modal.showModal({
            modalConfig: {
                templateUrl: "app/iplb/serverFarm/preview/iplb-server-farm-preview.html",
                controller: "IpLoadBalancerServerFarmPreviewCtrl",
                controllerAs: "IpLoadBalancerServerFarmPreviewCtrl",
                resolve: {
                    farm: () => farm
                }
            }
        });
    }

    update (farm) {
        this.$state.go("network.iplb.detail.server-farm.update", {
            serviceName: this.$stateParams.serviceName,
            farmId: farm.farmId
        });
    }

    delete (farm) {
        this.IpLoadBalancerActionService.deleteFarm(
            this.$stateParams.serviceName,
            farm
        ).then(() => this.init());
    }

    toggle (farm, server) {
        const newStatus = server.status === "active" ? "inactive" : "active";
        this.IpLoadBalancerServerService.update(
            farm.type,
            this.$stateParams.serviceName,
            farm.farmId,
            server.serverId, {
                status: newStatus
            }
        ).then(() => {
            // Apply value on model
            server.status = newStatus;
        });
    }

    createFarmActions (farms) {
        this.farmActions = {};
        farms.forEach(farm => {
            this.farmActions[farm.farmId] = [
                [{
                    text: this.i18n.preview,
                    run: () => this.farmPreview(farm)
                }],
                [{
                    text: this.i18n.update,
                    run: () => this.update(farm)
                }, {
                    text: this.i18n.remove,
                    run: () => this.delete(farm)
                }]
            ];
        });
    }

    serverActionTemplate () {
        return `
            <cui-dropdown-menu>
                <cui-dropdown-menu-button>
                    <ng-include src="'app/ui-components/icons/button-action.html'"></ng-include>
                </cui-dropdown-menu-button>
                <cui-dropdown-menu-body>
                    <div class="oui-action-menu">
                        <div class="oui-action-menu__item oui-action-menu-item">
                            <div class="oui-action-menu-item__icon">
                                <i class="oui-icon oui-icon-eye"></i>
                            </div>
                            <button class="oui-button oui-button_link oui-action-menu-item__label"
                                type="button"
                                data-ng-bind="'common_preview_see' | translate"
                                data-ng-click="ctrl.seeServerPreview($row)"></button>
                        </div>
                        <div class="oui-action-menu__item oui-action-menu-item">
                            <div class="oui-action-menu-item__icon"></div>
                            <button class="oui-button oui-button_link oui-action-menu-item__label"
                                type="button"
                                data-ng-bind="'iplb_farm_server_status_see' | translate"
                                data-ng-click="ctrl.seeServerStatus($row)"></button>
                        </div>
                    </div>
                    <div class="oui-action-menu">
                        <div class="oui-action-menu__item oui-action-menu-item">
                            <div class="oui-action-menu-item__icon">
                                <i class="oui-icon oui-icon-pen_line"></i>
                            </div>
                            <a class="oui-button oui-button_link oui-action-menu-item__label"
                                data-ng-bind="'common_modify' | translate"
                                data-ui-sref="network.iplb.detail.server-farm.server-update({
                                    farmId: farm.farmId,
                                    serverId: $row.serverId
                                })"></a>
                        </div>
                        <div class="oui-action-menu__item oui-action-menu-item">
                            <div class="oui-action-menu-item__icon">
                                <i class="oui-icon oui-icon-trash_line"></i>
                            </div>
                            <button class="oui-button oui-button_link oui-action-menu-item__label"
                                type="button"
                                data-ng-bind="'common_remove' | translate"
                                data-ng-click="ctrl.deleteServer(farm, $row)"></button>
                        </div>
                    </div>
                </cui-dropdown-menu-body>
            </cui-dropdown-menu>`;
    }

    getFarmText (farm) {
        let serverText = "";
        if (!_.get(farm.servers, "loading", false)) {
            const serverNumber = farm.servers.data.length;
            const serverLabel = serverNumber > 1 ?
                this.$translate.instant("iplb_farm_list_accordion_aside_server_many", { serverNumber }) :
                this.$translate.instant("iplb_farm_list_accordion_aside_server_single", { serverNumber });
            serverText = ` / ${this.$translate.instant(serverLabel, { serverNumber })}`;
        }

        return this.$filter("uppercase")(farm.type) + (farm.port ? `:${farm.port}` : "") + ` / ${farm.zoneText.microRegion.text}` + serverText;
    }

    getFarmName (farm) {
        if (!farm.displayName) {
            return this.$translate.instant("iplb_farm_list_accordion_title", {
                farmId: farm.farmId
            });
        }

        return `${farm.displayName} (${farm.farmId})`;
    }
}

angular.module("managerApp").controller("IpLoadBalancerServerFarmCtrl", IpLoadBalancerServerFarmCtrl);
