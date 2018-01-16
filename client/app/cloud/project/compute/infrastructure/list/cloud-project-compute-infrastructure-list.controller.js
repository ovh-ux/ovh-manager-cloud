(() => {
    class CloudProjectComputeInfrastructureListCtrl {
        constructor ($scope, $filter, $stateParams, CloudProjectComputeInfrastructureOrchestrator, CloudProjectComputeInfrastructureService, OvhApiCloudProjectVolume, RegionService) {
            this.$scope = $scope;
            this.$filter = $filter;
            this.$stateParams = $stateParams;
            this.CloudProjectComputeInfrastructureOrchestrator = CloudProjectComputeInfrastructureOrchestrator;
            this.InfrastructureService = CloudProjectComputeInfrastructureService;
            this.OvhApiCloudProjectVolume = OvhApiCloudProjectVolume;
            this.RegionService = RegionService;
        }

        $onInit () {
            this.serviceName = this.$stateParams.projectId;

            this.loaders = {
                infra: true,
                pager: true
            };

            this.table = {
                items: []
            };

            return this.OvhApiCloudProjectVolume.Lexi().query({ serviceName: this.serviceName }).$promise.then(volumes => {
                this.volumes = volumes;
            }).finally(() => {
                this.initInfra();
            });
        }

        initInfra () {
            return this.CloudProjectComputeInfrastructureOrchestrator.init({ serviceName: this.serviceName }).then(infra => {
                this.infra = infra;
                this.table.items = _.map(this.infra.vrack.publicCloud.items, instance => {
                    if (this.volumes) {
                        _.set(instance, "volumes", _.filter(this.volumes, volume => _.indexOf(volume.attachedTo, instance.id) >= 0));
                    }
                    return instance;
                });
            }).finally(() => {
                this.loaders.infra = false;
            });
        }

        priceTemplate () {
            return `
                <span data-ng-if="$row.status !== 'DRAFT' && $row.monthlyBilling.status !== 'ok'"
                      data-translate="cpci_vm_flavor_price"
                      data-translate-values="{ price: $row.price.price.text || '?' }">
                </span>
                <span data-ng-if="$row.status !== 'DRAFT' && $row.monthlyBilling.status === 'ok'"
                      data-translate="cpci_vm_flavor_month"
                      data-translate-values="{ price: $row.price.price.text || '?' }">
                </span>
                <oui-loader size="s" inline="true"
                            data-ng-if="$row.monthlyBilling.status === 'activationPending'"></oui-loader>
            `;
        }

        actionTemplate () {
            return `
            <cui-dropdown-menu>
                <cui-dropdown-menu-button>
                    <ng-include src="'app/ui-components/icons/button-action.html'"></ng-include>
                </cui-dropdown-menu-button>
                <cui-dropdown-menu-body>
                    <div class="oui-action-menu"
                         data-ng-if="$row.status === 'DRAFT'">
                        <div class="oui-action-menu__item oui-action-menu-item">
                            <div class="oui-action-menu-item__icon"></div>
                            <button class="oui-button oui-button_link oui-action-menu-item__label" type="button"
                                    data-ng-bind="'cpci_vm_action_delete' | translate"
                                    data-ng-click="$row.confirm = 'deleteConfirmPending'">
                            </button>
                        </div>
                    </div>
                    <div class="oui-action-menu"
                         data-ng-if="$row.status === 'ACTIVE'">
                        <div class="oui-action-menu__item oui-action-menu-item"
                             data-ng-if="!$row.monthlyBilling">
                            <div class="oui-action-menu-item__icon"></div>
                            <button class="oui-button oui-button_link oui-action-menu-item__label" type="button"
                                    data-ng-bind="'cpci_vm_action_monthly' | translate"
                                    data-ng-click="ComputeInfrastructureListCtrl.InfrastructureService.openMonthlyConfirmation($row)">
                            </button>
                        </div>
                        <div class="oui-action-menu__item oui-action-menu-item">
                            <div class="oui-action-menu-item__icon"></div>
                            <button class="oui-button oui-button_link oui-action-menu-item__label" type="button"
                                    data-ng-bind="'cpci_vm_action_create_snapshot' | translate"
                                    data-ng-click="ComputeInfrastructureListCtrl.InfrastructureService.openSnapshotWizard($row)">
                            </button>
                        </div>
                    </div>
                    <div class="oui-action-menu"
                         data-ng-if="$row.status === 'ACTIVE'">
                        <div class="oui-action-menu__item oui-action-menu-item">
                            <div class="oui-action-menu-item__icon"></div>
                            <button class="oui-button oui-button_link oui-action-menu-item__label" type="button"
                                    data-ng-bind="'cpci_vm_action_auth_info' | translate"
                                    data-ng-click="ComputeInfrastructureListCtrl.InfrastructureService.openLoginInformations($row)">
                            </button>
                        </div>
                        <div class="oui-action-menu__item oui-action-menu-item">
                            <div class="oui-action-menu-item__icon"></div>
                            <button class="oui-button oui-button_link oui-action-menu-item__label" type="button"
                                    data-ng-bind="'cpci_vm_action_vnc' | translate"
                                    data-ng-click="ComputeInfrastructureListCtrl.InfrastructureService.openVnc($row)">
                            </button>
                        </div>
                    </div>
                    <div class="oui-action-menu"
                         data-ng-if="$row.status === 'ACTIVE'">
                        <div class="oui-action-menu__item oui-action-menu-item">
                            <div class="oui-action-menu-item__icon"></div>
                            <button class="oui-button oui-button_link oui-action-menu-item__label" type="button"
                                    data-ng-bind="'cpci_vm_action_rescue' | translate"
                                    data-ng-click="ComputeInfrastructureListCtrl.InfrastructureService.rescueMode($row)">
                            </button>
                        </div>
                    </div>
                    <div class="oui-action-menu"
                         data-ng-if="$row.status === 'ACTIVE'">
                        <div class="oui-action-menu__item oui-action-menu-item">
                            <div class="oui-action-menu-item__icon"></div>
                            <button class="oui-button oui-button_link oui-action-menu-item__label" type="button"
                                    data-ng-bind="'cpci_vm_action_reboot' | translate"
                                    data-ng-click="ComputeInfrastructureListCtrl.InfrastructureService.rebootVirtualMachine($row, 'soft')">
                            </button>
                        </div>
                        <div class="oui-action-menu__item oui-action-menu-item">
                            <div class="oui-action-menu-item__icon"></div>
                            <button class="oui-button oui-button_link oui-action-menu-item__label" type="button"
                                    data-ng-bind="'cpci_vm_action_reboot_hard' | translate"
                                    data-ng-click="ComputeInfrastructureListCtrl.InfrastructureService.rebootVirtualMachine($row, 'hard')">
                            </button>
                        </div>
                    </div>
                    <div class="oui-action-menu"
                         data-ng-if="$row.status === 'ACTIVE'">
                        <div class="oui-action-menu__item oui-action-menu-item">
                            <div class="oui-action-menu-item__icon"></div>
                            <button class="oui-button oui-button_link oui-action-menu-item__label" type="button"
                                    data-ng-bind="'cpci_vm_action_reinstall' | translate"
                                    data-ng-click="ComputeInfrastructureListCtrl.InfrastructureService.reinstallVirtualMachine($row)">
                            </button>
                        </div>
                        <div class="oui-action-menu__item oui-action-menu-item">
                            <div class="oui-action-menu-item__icon"></div>
                            <button class="oui-button oui-button_link oui-action-menu-item__label" type="button"
                                    data-ng-bind="'cpci_vm_action_delete' | translate"
                                    data-ng-click="ComputeInfrastructureListCtrl.InfrastructureService.removeVirtualMachine($row)">
                            </button>
                        </div>
                    </div>
                    <div class="oui-action-menu"
                         data-ng-if="$row.status !== 'DRAFT' && $row.status !== 'ACTIVE' && $row.getStatusGroup() === 'OPENSTACK'">
                         <div class="oui-action-menu__item oui-action-menu-item"
                              data-ng-if="$row.status === 'RESCUE'">
                            <div class="oui-action-menu-item__icon"></div>
                            <button class="oui-button oui-button_link oui-action-menu-item__label" type="button"
                                    data-ng-bind="'cpci_vm_action_vnc' | translate"
                                    data-ng-click="ComputeInfrastructureListCtrl.InfrastructureService.openVnc($row)">
                            </button>
                        </div>
                        <div class="oui-action-menu__item oui-action-menu-item"
                              data-ng-if="$row.status === 'RESCUE'">
                            <div class="oui-action-menu-item__icon"></div>
                            <button class="oui-button oui-button_link oui-action-menu-item__label" type="button"
                                    data-ng-bind="'cpci_vm_action_rescue_end' | translate"
                                    data-ng-click="ComputeInfrastructureListCtrl.InfrastructureService.stopRescueMode($row, false)">
                            </button>
                        </div>
                        <div class="oui-action-menu__item oui-action-menu-item"
                              data-ng-if="$row.status === 'SUSPENDED'">
                            <div class="oui-action-menu-item__icon"></div>
                            <button class="oui-button oui-button_link oui-action-menu-item__label" type="button"
                                    data-ng-bind="'cpci_vm_action_resume' | translate"
                                    data-ng-click="ComputeInfrastructureListCtrl.InfrastructureService.resumeVirtualMachine($row)">
                            </button>
                        </div>
                        <div class="oui-action-menu__item oui-action-menu-item"
                              data-ng-if="$row.status !== 'RESCUE'">
                            <div class="oui-action-menu-item__icon"></div>
                            <button class="oui-button oui-button_link oui-action-menu-item__label" type="button"
                                    data-ng-bind="'cpci_vm_action_reboot_hard' | translate"
                                    data-ng-click="ComputeInfrastructureListCtrl.InfrastructureService.rebootVirtualMachine($row, 'hard')">
                            </button>
                        </div>
                    </div>
                    <div class="oui-action-menu"
                         data-ng-if="$row.status !== 'DRAFT' && $row.status !== 'ACTIVE'">
                        <div class="oui-action-menu__item oui-action-menu-item">
                            <div class="oui-action-menu-item__icon"></div>
                            <button class="oui-button oui-button_link oui-action-menu-item__label" type="button"
                                    data-ng-bind="'cpci_vm_action_delete' | translate"
                                    data-ng-click="ComputeInfrastructureListCtrl.InfrastructureService.removeVirtualMachine($row)">
                            </button>
                        </div>
                    </div>
                </cui-dropdown-menu-body>
            </cui-dropdown-menu>`;
        }
    }

    angular.module("managerApp").controller("CloudProjectComputeInfrastructureListCtrl", CloudProjectComputeInfrastructureListCtrl);
})();
