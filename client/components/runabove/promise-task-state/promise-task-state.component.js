angular.module("managerApp").component("promiseTaskState", {
    templateUrl: "components/runabove/promise-task-state/promise-task-state.html",
    controller: ["$timeout", "CloudStorageContainerTasksRunner", function ($timeout, CloudStorageContainerTasksRunner) {
        "use strict";

        var self = this;

        self.showDetails = false;
        self.taskCount = NaN;
        self.closeTimeout = null;
        self.runner = CloudStorageContainerTasksRunner;

        self.sumTasks = function () {
            return CloudStorageContainerTasksRunner.countTotalTasks();
        };

        self.getGlobalProgress = function (state) {
            var percents;
            switch (state) {
                case "done":
                    percents = Math.round((CloudStorageContainerTasksRunner.countDoneTasks() / self.sumTasks()) * 100);
                    break;
                case "error":
                    percents = Math.round((CloudStorageContainerTasksRunner.countErrorTasks() / self.sumTasks()) * 100);
                    break;
                case "pending":
                    percents = Math.round((CloudStorageContainerTasksRunner.countPendingTasks() / self.sumTasks()) * 100);
                    break;
            }
            if (state === "done" && percents === 100) {
                self.closeTimeout = $timeout(function() {
                    self.close();
                }, 3000);
            }
            return percents;
        };

        self.show = function (state) {
            if (self.showDetails === state) {
                self.showDetails = false;
                return;
            }
            self.showDetails = state;
        };

        // self.retry = function (task) {
        //     Task.retry(task);
        // };

        // self.abort = function (task) {
        //     Task.abort(task);
        // };

        self.close = function (force) {
            if (self.closeTimeout) {
                $timeout.cancel(self.closeTimeout);
                self.closeTimeout = null;
            }
            CloudStorageContainerTasksRunner.flush();
        };
    }]
});
