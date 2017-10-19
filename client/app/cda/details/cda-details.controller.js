angular.module("managerApp")
  .controller("CdaDetailsCtrl", function ($q, $stateParams, $translate, ovhDocUrl, URLS, CdaService, CloudMessage) {
    "use strict";

    var self = this;

    self.CdaService = CdaService;
    self.serviceName = "";
    self.messages = [];

    self.loading = true;

    self.guides = {
        title: $translate.instant("cda_guide_title"),
        list: [{
                    name: $translate.instant("cda_guide_name"),
                    url: ovhDocUrl.getDocUrl("storage")
                }],
        footer: $translate.instant("cda_guide_footer")

    }

     self.refreshMessage = function () {
        self.messages = self.messageHandler.getMessages();
    }

    self.loadMessage = function () {
        CloudMessage.unSubscribe("paas.cda");
        self.messageHandler = CloudMessage.subscribe("paas.cda", { onMessage: () => self.refreshMessage() });
    }

    function init () {
        self.loading = true;
        self.serviceName = $stateParams.serviceName;

        self.loadMessage();

        var initQueue = [];
        $q.allSettled(initQueue).finally(function () {
            self.loading = false;
        });
    }

    init();
  });