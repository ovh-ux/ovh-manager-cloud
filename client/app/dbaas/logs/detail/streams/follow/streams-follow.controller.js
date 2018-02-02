(() => {
    const RFC_URL = "TCP_TLS_RFC5424";
    const LTSV_URL = "TCP_TLS_LTSV_NUL";
    const GELF_URL = "TCP_TLS_GELF";
    class LogsStreamsFollowCtrl {
        constructor ($scope, $stateParams, $translate, ControllerHelper, UrlHelper, CloudMessage,
                     LogsStreamsService, LogsStreamsFollowService) {
            this.$scope = $scope;
            this.$stateParams = $stateParams;
            this.$translate = $translate;
            this.ControllerHelper = ControllerHelper;
            this.UrlHelper = UrlHelper;
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
                loaderFunction: () => this.LogsStreamsFollowService.getTestClientUrls(this.$stateParams.serviceName)
                    .then(serviceInfo => {
                        this.rfc5424Url = this.UrlHelper.findUrl(serviceInfo, RFC_URL, false);
                        this.ltsvUrl = this.UrlHelper.findUrl(serviceInfo, LTSV_URL, false);
                        this.gelfUrl = this.UrlHelper.findUrl(serviceInfo, GELF_URL, false);
                    })
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
            if (type === this.LogsStreamsFollowService.testTypeEnum.GELF) {
                this.LogsStreamsFollowService.copyGELCommandLine(this.stream.data, this.gelfUrl);
            } else if (type === this.LogsStreamsFollowService.testTypeEnum.LTSV) {
                this.LogsStreamsFollowService.copyLTSVCommandLine(this.stream.data, this.ltsvUrl);
            } else if (type === this.LogsStreamsFollowService.testTypeEnum.RFC5424) {
                this.LogsStreamsFollowService.copyRFCCommandLine(this.stream.data, this.rfc5424Url);
            }
        }

        getLastEvent () {
            return this.LogsStreamsFollowService.getLastEvent();
        }

        getTotalMessages () {
            return this.LogsStreamsFollowService.getTotalMessages();
        }
    }

    angular.module("managerApp").controller("LogsStreamsFollowCtrl", LogsStreamsFollowCtrl);
})();
