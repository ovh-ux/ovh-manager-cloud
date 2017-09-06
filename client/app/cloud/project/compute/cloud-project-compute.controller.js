class CloudProjectComputeCtrl {
    constructor ($q, $scope, $state, $stateParams, CloudProject, CloudProjectOrchestrator, CloudUserPref, moment) {
        this.$q = $q;
        this.$scope = $scope;
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.CloudProject = CloudProject;
        this.CloudProjectOrchestrator = CloudProjectOrchestrator;
        this.CloudUserPref = CloudUserPref;
        this.moment = moment;
    }

    $onInit () {
        this.serviceName = this.$stateParams.projectId;
        this.loading = true;
        this.infoMessageDismissed = true;
        this.messageId = "cloud_message_pci_de1";
        this.messageStart = "2017-09-06";
        this.messageEnd = "2017-10-06";

        this.init();
    }

    getRouteContext () {
        if (this.$state.includes("iaas.pci-project")) {
            return "iaas.pci-project.compute";
        }
        return "";
    }

    init () {
        this.loading = true;

        this.CloudUserPref.get(this.messageId)
            .then(value => {
                this.infoMessageDismissed = value && value.markedAsRead;
            });

        return this.shouldRedirectToProjectOverview()
            .then(redirectToOverview => {
                this.$scope.redirectToOverview = redirectToOverview;
            })
            .finally(() => {
                this.loading = false;
            });
    }

    shouldRedirectToProjectOverview () {
        if (this.$stateParams.forceLargeProjectDisplay) {
            return this.$q.when(false);
        }

        const hasTooMany = this.$q.all({
            hasTooManyInstances: this.CloudProjectOrchestrator.hasTooManyInstances(this.$stateParams.projectId),
            hasTooManyIps: this.CloudProjectOrchestrator.hasTooManyIps(this.$stateParams.projectId)
        }).then(result => result.hasTooManyInstances || result.hasTooManyIps);

        return this.CloudUserPref.get(`cloud_project_${this.serviceName}_overview`).then(params => {
            if (params && params.hide) {
                return false;
            }
            return hasTooMany;
        });
    }

    dismissInfoMessage () {
        this.infoMessageDismissed = true;
        this.CloudUserPref.set(this.messageId, { markedAsRead: new Date() });
    }

    isInfoMessageDismissed () {
        const now = moment();
        return this.infoMessageDismissed || !(now.isAfter(this.messageStart) && now.isBefore(this.messageEnd));
    }
}

angular.module("managerApp").controller("CloudProjectComputeCtrl", CloudProjectComputeCtrl);
