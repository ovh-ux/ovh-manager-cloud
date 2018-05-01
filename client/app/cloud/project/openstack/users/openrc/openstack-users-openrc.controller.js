"use strict";

angular.module("managerApp")
    .controller("OpenstackUsersOpenrcCtrl", function ($scope, OvhApiCloud, $httpParamSerializer, $uibModalInstance, CONFIG_API, openstackUser, $stateParams, $translate, URLS, OvhApiMe, RegionService) {
        var self = this;

        self.regionService = RegionService;
        self.openstackUser = openstackUser;
        self.projectId = $stateParams.projectId;

        self.form = {
            regions: []
        };

        self.data = {
            region: null,
            guideURL: null
        };

        self.loaders = {
            regions: false,
            download: false,
            guide: false
        };

        function init () {
            initGuideURL();
            getRegions();
        }

        function getRegions () {
            self.loaders.regions = true;
            return OvhApiCloud.Project().Region().v6().query({
                serviceName: self.projectId
            }).$promise.then(function (regions) {
                self.form.regions = regions;
                if (self.form.regions) {
                    self.data.region = self.form.regions[0];
                }
            })["finally"](function () {
                self.loaders.regions = false;
            });
        }

        function initGuideURL () {
            self.loaders.guide = true;
            OvhApiMe.v6().get().$promise.then(function (me) {
                var lang = me.ovhSubsidiary;
                self.data.guideURL = URLS.guides.openstack[lang];
            })["finally"](function () {
                self.loaders.guide = false;
            });
        }

        function buildOpenrcUrl () {
            var url = [
                (_.find(CONFIG_API.apis, {serviceType : "aapi"}) || {}).urlPrefix,
                OvhApiCloud.Project().User().Aapi().services.openrc.url,
                "?",
                $httpParamSerializer({
                    region: self.data.region,
                    download: 1
                })
            ].join("");

            var replacements = {
                serviceName: self.projectId,
                userId: openstackUser.id
            };

            // Build URL
            Object.keys(replacements).forEach(function (paramName) {
                url = url.replace(":" + paramName, replacements[paramName]);
            });

            return url;
        }

        self.downloadOpenrcFile = function () {
            var url = buildOpenrcUrl();
            var link = document.createElement("a");
            link.setAttribute("href", url);
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            self.close();
        };

        self.close = function () {
            $uibModalInstance.close();
        };

        self.cancel = function () {
            $uibModalInstance.dismiss();
        };

        init();
    });
