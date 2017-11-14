class VpsDashboardCtrl {
    constructor ($filter, $stateParams, $translate, CloudMessage, VpsActionService, VpsService) {
        this.$filter = $filter;
        this.$stateParams = $stateParams;
        this.$translate = $translate;
        this.CloudMessage = CloudMessage;
        this.serviceName = $stateParams.serviceName;
        this.VpsActionService = VpsActionService;
        this.VpsService = VpsService;

        this.plan = {};
        this.summary = {};
        this.vps = {};

        this.loaders = {
            init: false,
            summary: false,
            plan: false,
            polling: false
        }
    }

    $onInit () {
        this.loaders.init = true;
        this.loadVps();
        this.loadIps();
        this.loadPlan();
        this.loadSummary();
    }

    loadVps () {
        this.VpsService.getSelected(true)
            .then(vps => {
                this.vps = vps;
                const expiration = moment.utc(vps.expiration);
                this.vps.expiration = moment([expiration.year(), expiration.month(), expiration.date()]).toDate();
                this.vps.iconDistribution = vps.distribution ? "icon-" + vps.distribution.distribution : "";
                if (vps.isExpired) {
                    this.CloudMessage.warning(this.$translate.instant("common_service_expired", [vps.name]));
                } else if (vps.messages.length > 0) {
                    this.CloudMessage.error(this.$translate.instant("vps_dashboard_loading_error"), vps);
                }
            })
            .catch(err => this.CloudMessage.error(err))
            .finally(() => { this.loaders.init = false });
    }

    loadIps () {
        this.VpsService.getIps().then(ips => {
            this.vps.ips = ips.results;
            this.vps.ipv6Gateway = _.get(_.find(ips.results, { version: "v6" }), "gateway");
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
            .then((data) => { this.plan = data })
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

}

angular.module("managerApp").controller("VpsDashboardCtrl", VpsDashboardCtrl);
