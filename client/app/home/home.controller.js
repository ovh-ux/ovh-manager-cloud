"use strict";

angular.module("managerApp").controller("HomeCtrl",
    function ($state, OvhApiCloudProject, CLOUD_PROJECT_STATE) {

        function getDisplayablesProjects() {
            return OvhApiCloudProject.Lexi().queryDetails().then(function (projects) {
                _.remove(projects, { status: CLOUD_PROJECT_STATE.deleting });
                _.remove(projects, { status: CLOUD_PROJECT_STATE.deleted });
                _.remove(projects, { status: CLOUD_PROJECT_STATE.suspended });
                return projects;
            });
        }

        // If no project Public Cloud, redirect to order
        // ...This is ugly, but...
        getDisplayablesProjects().then(function (projects) {
            if (projects && projects.length) {
                return $state.go("iaas.pci-project.compute.infrastructure", {
                    projectId: projects[0].project_id
                });
            } else {
                return $state.go("iaas.pci-project-new");
            }
        }, function () {
            return $state.go("iaas.pci-project-new");
        });
    }
);
