angular.module("managerApp")
    .controller("CloudProjectRenameController", function ($rootScope, $q, $translate, $uibModal, CloudMessage, OvhApiCloudProject, SidebarMenu) {
        "use strict";

        var self = this;

        self.loader = {
            save: false
        };

        self.editing = {
            description: null
        };

        self.model = {
            description: null
        };

        self.$onInit = function () {
            self.editing.description = null;
            getProjectDescription();
        };

        function getProjectDescription () {
            OvhApiCloudProject.v6().get({
                serviceName: self.projectId
            }).$promise.then(function (data) {
                self.model.description = data.description;
            }).catch(function (err) {
                CloudMessage.error([$translate.instant("cloud_project_rename_loading_error"), err.data && err.data.message || ""].join(" "));
            });
        }

        self.saveDescription = function () {
            self.loader.save = true;

            OvhApiCloudProject.v6().put({
                serviceName: self.projectId
            }, {
                description: self.editing.description || ""
            }).$promise.then(function () {
                self.model.description = self.editing.description;
                var menuItem = SidebarMenu.getItemById(self.projectId);
                if (menuItem) {
                    menuItem.title = self.editing.description;
                }
            }).catch(function (err) {
                CloudMessage.error([$translate.instant("cloud_project_rename_error"), err.data && err.data.message || ""].join(" "));
            }).finally(function () {
                self.loader.save = false;
                self.editing.description = null;
            });
        };

        self.watchForEscapeKey = function ($event) {
            if ($event.keyCode === 27) { // escape key code
                self.editing.description = null;
            }
        };
    });
