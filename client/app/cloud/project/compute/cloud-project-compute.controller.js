class CloudProjectComputeCtrl {
    constructor ($q, $scope, $state, $stateParams, $translate, $window, OvhApiCloudProject, CloudMessage, CloudProjectOrchestrator,
                 CloudUserPref, FeatureAvailabilityService, moment, TranslateService, PCI_ANNOUNCEMENTS) {
        this.$q = $q;
        this.$scope = $scope;
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.$translate = $translate;
        this.$window = $window;
        this.OvhApiCloudProject = OvhApiCloudProject;
        this.CloudMessage = CloudMessage;
        this.CloudProjectOrchestrator = CloudProjectOrchestrator;
        this.PCI_ANNOUNCEMENTS = PCI_ANNOUNCEMENTS;
        this.FeatureAvailabilityService = FeatureAvailabilityService;
        this.CloudUserPref = CloudUserPref;
        this.TranslateService = TranslateService;
        this.moment = moment;
        this.messages = [];
        this.ads = [];
    }

    $onInit () {
        this.serviceName = this.$stateParams.projectId;
        this.loading = true;
        this.infoMessageDismissed = true;

        this.init();
        this.loadMessage();
    }

    loadMessage () {
        this.CloudMessage.unSubscribe("iaas.pci-project.compute");
        this.messageHandler = this.CloudMessage.subscribe("iaas.pci-project.compute", { onMessage: () => this.refreshMessage() });
    }

    refreshMessage () {
        this.messages = this.messageHandler.getMessages();
    }

    getRouteContext () {
        if (this.$state.includes("iaas.pci-project")) {
            return "iaas.pci-project.compute";
        }
        return "";
    }

    init () {
        this.loading = true;

        this.loadAnnouncements();

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

    loadAnnouncements () {
        const areDismissed = [];
        _.forEach(this.PCI_ANNOUNCEMENTS, announcement => {
            const now = moment();
            const afterTheStart = now.isAfter(announcement.messageStart);
            const beforeTheEnd = now.isBefore(announcement.messageEnd);
            if (afterTheStart && beforeTheEnd) {
                areDismissed.push(this.isInfoMessageDismissed(announcement));
            }
        });
        this.$q.all(areDismissed).then(areDismissedMessages => {
            this.ads = _.map(areDismissedMessages, announcement => this.augmentMessage(announcement));
        });
    }

    augmentMessage (message) {
        const augmentedMessage = _.cloneDeep(message);
        const locale = this.TranslateService.getGeneralLanguage();
        augmentedMessage.dismiss = () => {
            this.dismissInfoMessage(message.messageId);
        };
        augmentedMessage.src = augmentedMessage.sources[locale];
        augmentedMessage.alt = augmentedMessage.description[locale];
        return augmentedMessage;
    }

    dismissInfoMessage (messageId) {
        const message = _.find(this.ads, { messageId });
        message.dismissed = true;
        this.CloudUserPref.set(messageId, { markedAsRead: new Date() });
    }

    isInfoMessageDismissed (message) {
        return this.CloudUserPref.get(message.messageId).then(value => {
            message.dismissed = !!(!_.isEmpty(value) && value.markedAsRead);
            return message;
        });
    }
}

angular.module("managerApp").controller("CloudProjectComputeCtrl", CloudProjectComputeCtrl);
