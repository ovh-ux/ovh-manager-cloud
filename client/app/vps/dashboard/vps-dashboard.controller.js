class VpsDashboardCtrl {
    constructor ($filter, $stateParams, $translate, CloudMessage, ControllerHelper, VpsActionService, VpsService) {
        this.$filter = $filter;
        this.$stateParams = $stateParams;
        this.$translate = $translate;
        this.ControllerHelper = ControllerHelper;
        this.CloudMessage = CloudMessage;
        this.serviceName = $stateParams.serviceName;
        this.VpsActionService = VpsActionService;
        this.VpsService = VpsService;

        this.plan = {};
        this.summary = {};
        this.vps = {};

        this.loaders = {
            init: false,
            ip: false,
            summary: false,
            plan: false,
            polling: false,
            url: false
        };
    }

    $onInit () {
        this.initActions();
        this.loadVps();
        this.loadSummary();
        this.loadUrl();
    }

    loadVps () {
        this.loaders.init = true;
        this.VpsService.getSelectedVps(this.serviceName)
            .then(vps => {
                this.vps = vps;
                const expiration = moment.utc(vps.expiration);
                this.vps.expiration = moment([expiration.year(), expiration.month(), expiration.date()]).toDate();
                this.vps.iconDistribution = vps.distribution ? "icon-" + vps.distribution.distribution : "";
                this.vps.secondaryDns = (vps.secondaryDns == 0) ?
                    this.$translate.instant("vps_dashboard_secondary_dns_count_0") :
                    this.$translate.instant("vps_dashboard_secondary_dns_count_x", { count: vps.secondaryDns });
                this.loadIps();
                this.loadPlan();
            })
            .catch(err => this.CloudMessage.error(err))
            .finally(() => { this.loaders.init = false });
    }

    loadIps () {
        this.loaders.ips = true;
        this.VpsService.getIps(this.serviceName).then(ips => {
            this.vps.ips = ips.results;
            this.vps.ipv6Gateway = _.get(_.find(ips.results, { version: "v6" }), "gateway");
            this.loaders.ips = false;
        });
    }

    loadSummary () {
        this.loaders.summary = true;
        this.hasAdditionalDisk();
        this.VpsService.getTabSummary(this.serviceName, true)
            .then(summary => {
                this.summary = summary;
                this.snapshotOption();
            })
            .catch(err => this.CloudMessage.error(err))
            .finally(() => { this.loaders.summary = false });
    }

    loadPlan () {
        this.loaders.plan = true;
        this.VpsService.getServiceInfos(this.serviceName)
            .then((data) => {
                this.plan = data;
                if (!_.isEmpty(this.vps)) {
                    this.plan.offer = this.vps.model;
                }
            })
            .catch(err => this.CloudMessage.error(err))
            .finally(() => { this.loaders.plan = false });
    }

    loadUrl () {
        this.loaders.url = true;
        this.ControllerHelper.navigation.getConstant("changeOwner")
            .then(url => {
                this.actions.changeOwner.href = url;
                this.loaders.url = false;
            });
    }

    hasAdditionalDisk () {
        this.VpsService.hasAdditionalDiskOption(this.serviceName)
            .then(() => { this.hasAdditionalDisk = true })
            .catch(() => { this.hasAdditionalDisk = false });
    }

    snapshotOption () {
        this.snapshotDescription = this.summary.snapshot.creationDate ?
            this.$translate.instant("vps_tab_SUMMARY_snapshot_creationdate") + " " + moment(this.summary.snapshot.creationDate).format("LLL") :
            this.$translate.instant("vps_status_enabled");
        this.snapshot = {
            order: {
                text: this.$translate.instant("common_order"),
                state: "iaas.vps.detail.snapshot-order",
                stateParams: { serviceName: this.serviceName },
                isAvailable: () => !this.loaders.summary && this.summary.snapshot.optionAvailable
            },
            take: {
                text: this.$translate.instant("vps_configuration_snapshot_take_title_button"),
                callback: () => this.VpsActionService.takeSnapshot(this.serviceName),
                isAvailable: () => !this.loaders.summary && this.summary.snapshot.optionActivated && !this.summary.snapshot.creationDate
            },
            restore: {
                text: this.$translate.instant("vps_configuration_snapshot_restore_title_button"),
                callback: () => this.VpsActionService.restoreSnapshot(this.serviceName),
                isAvailable: () => !this.loaders.summary && this.summary.snapshot.creationDate
            },
            delete: {
                text: this.$translate.instant("vps_configuration_delete_snapshot_title_button"),
                callback: () => this.VpsActionService.deleteSnapshot(this.serviceName),
                isAvailable: () => !this.loaders.summary && this.summary.snapshot.creationDate
            },
            terminate: {
                text: this.$translate.instant("vps_configuration_desactivate_option"),
                callback: () => this.VpsActionService.terminateSnapshot(this.serviceName),
                isAvailable: () => !this.loaders.summary && this.summary.snapshot.optionActivated
            }
        }
    }

    initActions () {
        this.actions = {
            resetPassword: {
                text: this.$translate.instant("vps_configuration_reinitpassword_title_button"),
                callback: () => this.VpsActionService.password(this.serviceName)
            },
            reboot: {
                text: this.$translate.instant("vps_configuration_reboot_title_button"),
                callback: () => this.VpsActionService.reboot(this.serviceName)
            },
            reinstall: {
                text: this.$translate.instant("vps_configuration_reinstall_title_button"),
                callback: () => this.VpsActionService.reinstall(this.serviceName)
            },
            kvm: {
                text: this.$translate.instant("vps_configuration_kvm_title_button"),
                callback: () => this.VpsActionService.kvm(this.serviceName, this.vps.hasKVM),
                isAvailable: () => !this.loaders.init
            },
            reverseDns: {
                text: this.$translate.instant("vps_configuration_reversedns_title_button"),
                callback: () => this.VpsActionService.reverseDns(this.serviceName),
                isAvailable: () => !this.loaders.ip
            },
            manageAutorenew: {
                text: this.$translate.instant("common_manage"),
                href: this.ControllerHelper.navigation.getUrl("renew", { serviceName: this.serviceName, serviceType: "VPS" }),
                isAvailable: () => !this.loaders.init && !this.loaders.plan
            },
            manageContact: {
                text: this.$translate.instant("common_manage"),
                href: this.ControllerHelper.navigation.getUrl("contacts", { serviceName: this.serviceName }),
                isAvailable: () => !this.loaders.init
            },
            manageIps: {
                text: this.$translate.instant("vps_configuration_add_ipv4_title_button"),
                href: this.ControllerHelper.navigation.getUrl("ip", { serviceName: this.serviceName }),
                isAvailable: () => !this.loaders.init && !this.loaders.ip
            },
            monitoringSla: {
                text: this.$translate.instant("common_manage"),
                callback: () => this.VpsActionService.monitoringSla(this.serviceName, !this.vps.slaMonitoring),
                isAvailable: () => !this.loaders.init
            },
            changeOwner: {
                text: this.$translate.instant("vps_change_owner"),
                isAvailable: () => !this.loaders.url
            },
            upgrade: {
                text: this.$translate.instant("vps_configuration_upgradevps_title_button"),
                state: "iaas.vps.detail.upgrade",
                stateParams: { serviceName: this.serviceName },
                isAvailable: () => !this.loaders.init
            },
            changeName: {
                text: this.$translate.instant("common_edit"),
                callback: () => this.VpsActionService.editName(this.vps.displayName, this.serviceName).then(() => this.loadVps()),
                isAvailable: () => !this.loaders.init
            },
            orderWindows: {
                text: this.$translate.instant("common_order"),
                state: "iaas.vps.detail.windows-order",
                stateParams: { serviceName: this.serviceName },
                isAvailable: () => !this.loaders.summary && !this.summary.windowsActivated
            },
            terminateWindows: {
                text: this.$translate.instant("vps_configuration_desactivate_option"),
                callback: () => this.VpsActionService.terminateWindows(this.serviceName),
                isAvailable: () => !this.loaders.summary && this.summary.windowsActivated
            }
        };
    }

}

angular.module("managerApp").controller("VpsDashboardCtrl", VpsDashboardCtrl);
