class LogsStreamsFollowCtrl {
    constructor ($scope, $stateParams, $translate, ControllerHelper, CloudMessage,
                 LogsStreamsService, LogsStreamsFollowService) {
        this.$scope = $scope;
        this.$stateParams = $stateParams;
        this.$translate = $translate;
        this.ControllerHelper = ControllerHelper;
        this.CloudMessage = CloudMessage;
        this.LogsStreamsService = LogsStreamsService;
        this.LogsStreamsFollowService = LogsStreamsFollowService;

        this.initLoaders();

        $scope.$on("$destroy", () => {
            this.closeConnection();
        });
    }

    initLoaders () {
        this.stream = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.LogsStreamsService.getAapiStream(this.$stateParams.serviceName, this.$stateParams.streamId)
                .then(stream => {
                    this.LogsStreamsFollowService.openConnection(stream);
                    return stream;
                })
        });
        this.stream.load();

        this.testClientUrls = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.LogsStreamsFollowService.getTestClientUrls(this.$stateParams.serviceName, this.$stateParams.streamId)
        });
        this.testClientUrls.load();
    }

    getMessages () {
        return this.LogsStreamsFollowService.getMessages();
    }

    getAlertType (level) {
        return this.LogsStreamsFollowService.getAlertType(level);
    }

    getAlertLabel (level) {
        return this.LogsStreamsFollowService.getAlertLabel(level);
    }

    closeConnection () {
        this.CloudMessage.flushChildMessage();
        this.LogsStreamsFollowService.closeConnection();
    }

    openConnection () {
        this.CloudMessage.flushChildMessage();
        this.LogsStreamsFollowService.openConnection(this.stream.data);
    }

    isConnectionClosed () {
        return this.LogsStreamsFollowService.isConnectionClosed();
    }

    isWaitingForMessages () {
        return this.LogsStreamsFollowService.isWaitingForMessages();
    }

    copyAddress () {
        this.CloudMessage.flushChildMessage();
        this.LogsStreamsFollowService.copyWebSocketAddress(this.stream.data);
    }

    testFlow (type) {
        this.LogsStreamsFollowService.copyCommandLine(this.stream.data, type);
    }

    getLastEvent () {
        return this.LogsStreamsFollowService.getLastEvent();
    }

    getTotalMessages () {
        return this.LogsStreamsFollowService.getTotalMessages();
    }
}

angular.module("managerApp").controller("LogsStreamsFollowCtrl", LogsStreamsFollowCtrl);
