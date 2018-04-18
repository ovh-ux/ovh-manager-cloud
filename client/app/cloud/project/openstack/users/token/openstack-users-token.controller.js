"use strict";

angular.module("managerApp")
    .controller("CloudProjectOpenstackUsersTokenCtrl", function ($q, $uibModalInstance, $stateParams, CloudMessage, $translate, OvhApiCloudProjectUser, openstackUser, OpenstackUsersToken, URLS, OvhApiMe) {
        var self = this;

        self.openstackUser = openstackUser;
        self.projectId = $stateParams.projectId;
        self.tokenGuide = {
            lang: null,
            link: null
        };

        self.generateToken = {
            password: null,
            tokens: null
        };
        self.loaders = {
            generateToken: false
        };

        function init () {
            self.generateToken.tokens = OpenstackUsersToken.get(self.projectId, self.openstackUser.id);
        }

        // returns openstack token guide depending on current choosen language
        function getTokenGuideUrl () {
            var urls = URLS.guides.xauthtoken;
            return urls[self.tokenGuide.lang.toUpperCase()];
        }

        self.generate = function () {
            if (!self.loaders.generateToken) {
                self.loaders.generateToken = true;
                return $q.allSettled([
                    OvhApiCloudProjectUser.v6().token({
                        serviceName: self.projectId,
                        userId: self.openstackUser.id
                    }, {
                        password: self.generateToken.password
                    }).$promise.then(function (openstackToken) {
                        OpenstackUsersToken.put(self.projectId, self.openstackUser.id, openstackToken);
                        self.generateToken.tokens = openstackToken;
                    }, function (err) {
                        CloudMessage.error([$translate.instant("cpou_token_error"), err.data && err.data.message || ""].join(" "));
                    }),
                    OvhApiMe.v6().get().$promise.then(function (me) {
                        // set guide lang
                        self.tokenGuide.lang = me.ovhSubsidiary;
                        self.tokenGuide.link = getTokenGuideUrl();
                    })
                ])["finally"](function () {
                    self.loaders.generateToken = false;
                });
            }
        };

        self.close = function () {
            $uibModalInstance.close();
        };

        self.cancel = function () {
            $uibModalInstance.dismiss();
        };

        init();
    });
