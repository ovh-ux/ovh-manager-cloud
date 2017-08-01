"use strict";

angular.module("managerApp").service("DBaasTsProjectService", function (DBaasTsProject, $state) {

    // This function is to be called from the "resolve" property of states requiring an active project.
    // It loads the project (from the cache, except on initial load) and if not active, redirects
    // to the settings state.
    //
    // It returns the project-loading promise to delay actual state transition until the project
    // has been checked. This prevents a visual glitch where the target state is displayed briefly
    // before redirecting to the settings state (see UCLOUD-1085)

    this.ensureProjectIsActive = function (params) {

        return DBaasTsProject.Lexi().get({
            serviceName: params.serviceName
        }).$promise
            .then(function (project) {
                if (!project.regionId || project.status !== "ACTIVE") {
                    $state.go("dbaas.dbaasts-project.dbaasts-project-details.dbaasts-project-details-settings", { serviceName: params.serviceName });
                }
            })["catch"](function () {
                // just swallow the error and continue. The target state will itself load the project
                // and display an appropriate error message
            });
    };
});
