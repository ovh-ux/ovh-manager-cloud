// our sidebar edit controller
angular.module("managerApp").controller("DBaasTsSidebarEditCtrl", [
    "$rootScope",
    "$scope",
    "$timeout",
    "$translate",
    "managerSidebarMenuItemController",
    "DBaasTsSidebarEditMediator",
    "locals",
    "DBaasTsProject",
    "Toast",
function ($rootScope, $scope, $timeout, $translate, managerSidebarMenuItemController, DBaasTsSidebarEditMediator, locals, DBaasTsProject, Toast) {
    "use strict";

    var self = this;

    $scope.loader = {
        save: false
    };

    $scope.model = {
        name: locals.project.name
    };

    self.init = function () {
        DBaasTsSidebarEditMediator.startEdition($scope);
        // if state change, abort edition
        DBaasTsSidebarEditMediator.watchForLeavingEdition();
    };

    $scope.resetTemplate = function () {
        managerSidebarMenuItemController.loadDefaultTemplate();
    };

    $scope.cancelEdition = function () {
        DBaasTsSidebarEditMediator.stopEdition();
    };

    $scope.saveName = function () {
        $scope.loader.save = true;

        DBaasTsProject.Lexi().setup({
            serviceName: locals.project.serviceName
        }, {
            displayName: $scope.model.name || ""
        }).$promise.then(function () {
            // Update the project name in sidebar
            locals.sidebarElt.name = $scope.model.name;
            locals.project.name = $scope.model.name;

            $rootScope.$broadcast("dbaasts-reloadproject", locals.project.serviceName);

        }, function (err) {
            Toast.error([$translate.instant("dbaasts_sidebar_edit_name_error"), err.data && err.data.message || ""].join(" "));

        })["finally"](function () {
            $scope.loader.save = false;
            DBaasTsSidebarEditMediator.stopEdition();
            DBaasTsProject.Lexi().resetCache();
        });
    };

    $scope.watchForEscapeKey = function ($event) {
        if ($event.keyCode === 27) { // escape key code
            $scope.cancelEdition();
        }
    };

    self.init();

}]);
