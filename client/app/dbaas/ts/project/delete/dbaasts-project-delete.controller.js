"use strict";

angular.module("managerApp").controller("DBaasTsSidebarDeleteCtrl",
    function (locals, $state, $uibModal, Toast, $translate, DBaasTsProject) {

        function DeleteModalCtrl ($uibModalInstance) {
            var self = this;
            self.loaders = {};

            self.confirm = function () {
                self.loaders.deleting = true;

                DBaasTsProject.Lexi().delete({
                    serviceName: locals.project.serviceName

                }).$promise.then(function () {
                    Toast.success($translate.instant("cloud_project_delete_email_sent"));
                    $uibModalInstance.close();

                }, function () {
                    Toast.error($translate.instant("cloud_project_delete_error"));

                })["finally"](function () {
                    self.loaders.deleting = false;
                });
            };

            self.cancel = $uibModalInstance.dismiss;
        }

        $uibModal.open({
            templateUrl: "app/dbaas/ts/project/delete/dbaasts-project-delete.html",
            controller: DeleteModalCtrl,
            controllerAs: "DBaasTsProjectDeleteCtrl",
            windowClass: "cloud_project-delete-modal",
            backdropClass: "cloud_project-delete-modal-backdrop"
        });
    });

