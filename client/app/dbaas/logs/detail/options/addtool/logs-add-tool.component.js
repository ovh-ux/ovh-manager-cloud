angular.module("managerApp").component("logsAddTool", {
    templateUrl: "app/dbaas/logs/detail/options/addtool/logs-add-tool.html",
    controller: "logsAddToolCtrl",
    controllerAs: "ctrl",
    bindings: {
        text: "@",
        toolName: "@",
        currentUsage: "<",
        maxUsage: "<",
        callback: "&"
    }
});
