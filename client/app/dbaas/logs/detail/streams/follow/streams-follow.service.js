(() => {
    const RFC_URL = "TCP_TLS_RFC5424";
    const LTSV_URL = "TCP_TLS_LTSV_NUL";
    const GELF_URL = "TCP_TLS_GELF";
    const WEB_SOCKET_URL = "WEB_SOCKET";

    class LogsStreamsFollowService {
        constructor ($websocket, $translate, OvhApiDbaas, LogsStreamsService, ControllerHelper, CloudMessage, ServiceHelper, UrlHelper) {
            this.$websocket = $websocket;
            this.$translate = $translate;
            this.LogsStreamsService = LogsStreamsService;
            this.ControllerHelper = ControllerHelper;
            this.CloudMessage = CloudMessage;
            this.ServiceHelper = ServiceHelper;
            this.UrlHelper = UrlHelper;
            this.LogsAapiService = OvhApiDbaas.Logs().Aapi();

            this.webSocket = null;
            this.messages = [];
            this.totalMessages = 0;
            this.connectionClosed = false;
            this.waitingForMessages = true;
            this.lastEvent = 0;

            this.initializeData();
        }

        initializeData () {
            this.alertTypeLabelMap = {
                0: {
                    label: "logs_streams_follow_emergency",
                    type: "error"

                },
                1: {
                    label: "logs_streams_follow_alert",
                    type: "error"

                },
                2: {
                    label: "logs_streams_follow_critical",
                    type: "error"

                },
                3: {
                    label: "logs_streams_follow_error",
                    type: "warning"

                },
                4: {
                    label: "logs_streams_follow_warning",
                    type: "warning"

                },
                5: {
                    label: "logs_streams_follow_notice",
                    type: "primary"

                },
                6: {
                    label: "logs_streams_follow_info",
                    type: "info"

                },
                7: {
                    label: "logs_streams_follow_debug",
                    type: "default"

                }
            };
        }

        /**
         * Makes API call to get LTSV, GELF and RFC client configures URL's
         * Show error on UI if failed to get data from API
         * @param {string} serviceName
         */
        getTestClientUrls (serviceName) {
            return this.LogsAapiService.home({ serviceName })
                .$promise
                .then(serviceInfo => {
                    this.rfc5424Url = this.UrlHelper.findUrl(serviceInfo, RFC_URL, false);
                    this.ltsvUrl = this.UrlHelper.findUrl(serviceInfo, LTSV_URL, false);
                    this.gelfUrl = this.UrlHelper.findUrl(serviceInfo, GELF_URL, false);
                    return serviceInfo;
                })
                .catch(this.ServiceHelper.errorHandler("logs_streams_get_command_urls_error"));
        }

        /**
         * Copies websocket URL for a given stream into clipboard.
         * Shows exception message on UI if failed to copy to clipboard.
         * @param {object} stream
         */
        copyWebSocketAddress (stream) {
            const url = this.UrlHelper.findUrl(stream, WEB_SOCKET_URL);
            if (!url) {
                this.CloudMessage.error({ textHtml: this.$translate.instant("logs_streams_follow_get_websocket_error", { stream: stream.info.title }) });
            } else {
                const error = this.ControllerHelper.copyToClipboard(url);
                if (error) {
                    this.CloudMessage.error({ textHtml: this.$translate.instant("logs_streams_follow_copy_websocket_error", {
                        stream: stream.info.title,
                        url
                    }) });
                } else {
                    this.CloudMessage.success({ textHtml: this.$translate.instant("logs_streams_follow_copy_websocket_success") });
                }
            }
        }

        getTotalMessages () {
            return this.totalMessages;
        }

        getLastEvent () {
            return this.lastEvent;
        }

        getMessages () {
            return this.messages;
        }

        getAlertType (level) {
            return this.alertTypeLabelMap[level] ? this.alertTypeLabelMap[level].type : "";
        }

        getAlertLabel (level) {
            return this.alertTypeLabelMap[level] ? this.alertTypeLabelMap[level].label : "";
        }

        isConnectionClosed () {
            return this.connectionClosed;
        }

        isWaitingForMessages () {
            return this.waitingForMessages;
        }

        /**
         * Close websocket connection
         */
        closeConnection () {
            this.webSocket.close();
        }

        /**
         * Open websocket connection to given stream
         * @param {object} stream
         */
        openConnection (stream) {
            this.waitingForMessages = true;
            this.connectionClosed = false;
            this.messages = [];
            this.totalMessages = 0;
            this._connectToWebSocket(stream);
        }

        /**
         * Copies given client command line to clipboard. Shows status message on UI.
         * Shows error if copy failed, success otherwise.
         * @param {Object} stream
         * @param {string} type
         */
        copyCommandLine (stream, type) {
            const token = this.LogsStreamsService.getStreamToken(stream);
            if (token) {
                let command = "";
                const now = new Date();
                const dateFormatted = now.toISOString();
                const timestamp = Math.round(now.getTime() / 1000);
                if (type === "GELF") {
                    command = `echo -e '{"version":"1.1", "host": "example.org", "short_message": "A short GELF message that helps you identify what is going on", "full_message": "Backtrace here more stuff", "timestamp": ${timestamp}, "level": 1, "_user_id": 9001, "_some_info": "foo", "some_metric_num": 42.0, "_X-OVH-TOKEN":"${token}"}\\0' | openssl s_client -quiet -no_ign_eof  -connect ${this.gelfUrl}`;
                } else if (type === "LTSV") {
                    command = `echo -e 'X-OVH-TOKEN:${token}\\thost:example.org\\ttime:${dateFormatted}\\tmessage:A short LTSV message that helps you identify what is going on\\tfull_message:Backtrace here more stuff\\tlevel:1\\tuser_id:9001\\tsome_info:foo\\tsome_metric_num:42.0\\0' | openssl s_client -quiet -no_ign_eof  -connect ${this.ltsvUrl}`;
                } else if (type === "RFC5424") {
                    command = `echo -e '<6>1 ${dateFormatted} 149.202.165.20 example.org - - [exampleSDID@8485 user_id="9001"  some_info="foo" some_metric_num="42.0" X-OVH-TOKEN="${token}"] A short RFC 5424 message that helps you identify what is going on\'\\n | openssl s_client -quiet -no_ign_eof  -connect ${this.rfc5424Url}`;
                }
                const error = this.ControllerHelper.copyToClipboard(command);
                if (error) {
                    this.CloudMessage.error({ textHtml: this.$translate.instant("logs_streams_follow_copy_command_error", {
                        stream: stream.info.title,
                        command,
                        type
                    }) });
                } else {
                    this.CloudMessage.success({ textHtml: this.$translate.instant("logs_streams_follow_copy_command_success", { type }) });
                }
            }
        }

        /**
         * opens websocket connection and connects to given stream URL
         * @param {object} stream
         */
        _connectToWebSocket (stream) {
            const url = this.UrlHelper.findUrl(stream, WEB_SOCKET_URL);
            if (url) {
                this.webSocket = this.$websocket(url);
                let response;
                let message;
                this.webSocket.onMessage(event => {
                    this.waitingForMessages = false;
                    this.totalMessages++;
                    try {
                        response = JSON.parse(event.data);
                        message = JSON.parse(response.message);
                    } catch (err) {
                        response = { username: "anonymous", message: event.data };
                        message = {};
                        this.ServiceHelper.errorHandler(err);
                    }
                    this.messages.unshift({
                        type: this.getAlertType(message.level),
                        label: this.getAlertLabel(message.level),
                        code: message.level,
                        timestamp: message.timestamp,
                        content: response.message
                    });
                    this.lastEvent = message.timestamp;
                    if (this.messages.length > 20) {
                        this.messages.pop();
                    }
                    if (this.totalMessages === 1000) {
                        this.closeConnection();
                    }
                });

                this.webSocket.onError(err => {
                    this.CloudMessage.error({ textHtml: this.$translate.instant("logs_streams_follow_connection_error", { message: err }) });
                });

                this.webSocket.onClose(() => {
                    this.connectionClosed = true;
                    this.waitingForMessages = false;
                });

                this.webSocket.onOpen(() => {
                    this.connectionClosed = false;
                    this.waitingForMessages = true;
                    this.messages = [];
                    this.totalMessages = 0;
                });
            } else {
                this.CloudMessage.error({ textHtml: this.$translate.instant("logs_streams_follow_get_websocket_error", { stream: stream.info.title }) });
            }
        }
    }

    angular.module("managerApp").service("LogsStreamsFollowService", LogsStreamsFollowService);
})();
