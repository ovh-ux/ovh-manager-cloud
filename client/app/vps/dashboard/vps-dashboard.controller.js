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
            polling: false
        };
    }

    $onInit () {
        this.loaders.init = true;
        this.initActions();

        this.loadVps();
        this.loadSummary();
    }

    loadVps () {
        this.VpsService.getSelectedVps(this.serviceName)
            .then(vps => {
                this.vps = vps;
                const expiration = moment.utc(vps.expiration);
                this.vps.expiration = moment([expiration.year(), expiration.month(), expiration.date()]).toDate();
                this.vps.iconDistribution = vps.distribution ? "icon-" + vps.distribution.distribution : "";
                this.loadIps();
                this.loadPlan();
            })
            .catch(err => this.CloudMessage.error(err))
            .finally(() => { this.loaders.init = false });
    }

    loadIps () {
        this.loaders.ips = true;
        this.VpsService.getIps().then(ips => {
            this.vps.ips = ips.results;
            this.vps.ipv6Gateway = _.get(_.find(ips.results, { version: "v6" }), "gateway");
            this.loaders.ips = false;
        });
    }

    loadSummary () {
        this.loaders.summary = true;
        this.hasAdditionalDisk();
        this.VpsService.getTabSummary(true)
            .then(summary => { this.summary = summary })
            .catch(err => this.CloudMessage.error(err))
            .finally(() => { this.loaders.summary = false });
    }

    loadPlan () {
        this.loaders.plan = true;
        this.VpsService.getServiceInfos()
            .then((data) => {
                this.plan = data;
                if (!_.isEmpty(this.vps)) {
                    this.plan.offer = this.vps.model;
                }
            })
            .catch(err => this.CloudMessage.error(err))
            .finally(() => { this.loaders.plan = false });
    }

    hasAdditionalDisk () {
        this.VpsService.hasAdditionalDiskOption()
            .then(() => { this.hasAdditionalDisk = true })
            .catch(() => { this.hasAdditionalDisk = false });
    }

    showEditName (displayName) {
        this.VpsActionService.editName(displayName, this.serviceName);
    }

    setAction (action) {
        switch (action) {
            case "password":
                this.VpsActionService.password();
                break;
            case "reboot":
                this.VpsActionService.reboot();
                break;
            case "reinstall":
                this.VpsActionService.reinstall();
                break;
            case "kvm":
                this.VpsActionService.kvm(this.serviceName, this.vps.hasKVM);
                break;
            case "reverse-dns":
                this.VpsActionService.reverseDns();
                break;
            default:
                return this.CloudMessage.error(this.$translate.instant("vps_dashboard_loading_error"));
        }

    }

    initActions () {
        this.actions = {
            manageAutorenew: {
                text: this.$translate.instant("common_manage"),
                href: this.ControllerHelper.navigation.getUrl("renew", { serviceName: this.serviceName, serviceType: "VPS" }),
                isAvailable: () => !this.plan.loading && !this.plan.hasErrors
            },
            manageContact: {
                text: this.$translate.instant("common_manage"),
                href: this.ControllerHelper.navigation.getUrl("contacts", { serviceName: this.serviceName }),
                isAvailable: () => !this.plan.loading && !this.plan.hasErrors
            }// ,
            // changeOwner: {
            //     text: this.$translate.instant("vps_change_owner"),
            //     href: this.ControllerHelper.navigation.getUrl("changeOwner", { serviceName: this.serviceName }),
            //     isAvailable: () => !this.plan.loading && !this.plan.hasErrors
            // }
        };
    }

    switchSLA (state) {
        this.VpsService.update({ slaMonitoring: state })
            .then(() => {
                this.vps.slaMonitoring = state;
                this.CloudMessage.success(this.$translate.instant("vps_configuration_monitoring_sla_ok_" + state));
            })
            .catch(() => this.CloudMessage.error(this.$translate.instant("vps_configuration_monitoring_sla_error_" + state)));
    }

}

angular.module("managerApp").controller("VpsDashboardCtrl", VpsDashboardCtrl);
