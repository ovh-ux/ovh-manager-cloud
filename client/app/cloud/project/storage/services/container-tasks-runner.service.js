angular.module("managerApp").service("CloudStorageContainerTasksRunner", [
    "$q",
    "$rootScope",
    function ($q, $rootScope) {
        "use strict";

        var defaultQueueName = "main";
        var taskQueues = {};

        var self = this;

        self.limit = 4;

        /**
         * Flush tasks.
         */
        self.flush = function () {
            taskQueues = {};
        };

        /**
         * Get queue list.
         * @return {Array} queue list
         */
        self.getQueues = function () {
            return taskQueues;
        };

        /**
         * Count number of running tasks.
         * @return {number} number of running tasks
         */
        self.countRunningTasks = function () {
            return self.countTasks("running");
        };

        /**
         * Count total number of tasks.
         * @return {number} total number of tasks
         */
        self.countTotalTasks = function () {
            return self.countTasks("total");
        };

        /**
         * Count number of pending tasks.
         * @return {number} number of pending tasks
         */
        self.countPendingTasks = function () {
            return self.countTotalTasks() - self.countDoneTasks() - self.countErrorTasks();
        };

        /**
         * Count number of done tasks.
         * @return {number} number of done tasks
         */
        self.countDoneTasks = function () {
            return self.countTasks("success");
        };

        /**
         * Count tasks in error.
         * @return {number} number of tasks in error
         */
        self.countErrorTasks = function () {
            return self.countTasks("error");
        };

        /**
         * Count number of tasks in a specific state.
         * @params {...string} states to count
         * @return {number} number of tasks in theses states
         */
        self.countTasks = function () {
            var states = arguments;
            return _.chain(_.values(taskQueues))
                .reduce(function (result, queue) {
                    var currentSum = _.chain(queue).pick(states).sum().value();
                    return result + currentSum;
                }, 0)
                .value();
        };

        /**
         * Add task to a queue.
         * @param  {string}    queueName  Queue name (optional, default: "main")
         * @param  {Function}  task       List of functions returning promises
         * @return {Promise} the promise for all this task queue
         */
        self.addTask = function (queueName, task) {
            if (!task) {
                task = queueName;
                queueName = defaultQueueName;
            }

            this.enqueue(queueName, [task]);

            var queue = taskQueues[queueName];

            return queue.defer.promise;
        };

        /**
         * Create controlled tasks queue.
         * @param  {string}           queueName   Queue name (optional, default: "main")
         * @param  {Array<Function>}  tasks       List of functions returning promises
         * @param  {number}           limit       Concurrency limit (default: 3)
         * @return {Promise} the promise for all this task queue
         */
        self.enqueue = function (queueName, tasks, limit) {
            if (_.isArray(queueName)) {
                tasks = queueName;
                limit = tasks;
                queueName = defaultQueueName;
                if (!_.isNumber(limit)) {
                    limit = self.limit;
                }
            }

            var defer = $q.defer();

            function next (queue) {
                if (!queue.remainingTasks.length && queue.running === 0) {
                    return queue.defer.resolve({
                        success: queue.successOutput,
                        error: queue.errorOutput
                    });
                }

                while (queue.remainingTasks.length > 0 && queue.running < queue.limit) {
                    var task = queue.remainingTasks.shift();
                    queue.running++;
                    decorateTask(task)
                        .then(function (data) {
                            queue.successOutput.push(data);
                            queue.success++;
                        }) // jshint ignore:line
                        .catch(function (err) {
                            queue.errorOutput.push(err);
                            queue.error++;
                        }) // jshint ignore:line
                        .finally(function () {
                            queue.running--;
                            queue.defer.notify(queue);
                            next(queue);
                        }); // jshint ignore:line
                }
            }

            var queue = taskQueues[queueName];

            if (queue && !queue.remainingTasks.length && queue.running === 0) {
                self.flush();
                queue = null;
            }

            if (!queue) {
                queue = {
                    name: queueName,
                    limit: limit || self.limit,
                    running: 0,
                    success: 0,
                    error: 0,
                    defer: defer,
                    remainingTasks: tasks,
                    total: tasks.length,
                    successOutput: [],
                    errorOutput: []
                };
                taskQueues[queueName] = queue;
                next(queue);
            } else {
                queue.remainingTasks = queue.remainingTasks.concat(tasks);
                queue.total += tasks.length;
            }

            return defer.promise;
        };

        function decorateTask (task) {
            return $q.when()
                .then(function () {
                    $rootScope.$broadcast("cloudStorageContainerTasksRunner:start_task");
                    return task();
                })
                .then(function (result) {
                    $rootScope.$broadcast("cloudStorageContainerTasksRunner:finish_task", {
                        status: "success",
                        payload: result
                    });
                    return result;
                })
                .catch(function (error) {
                    $rootScope.$broadcast("cloudStorageContainerTasksRunner:finish_task", {
                        status: "error",
                        payload: error
                    });
                    return $q.reject(error);
                });
        }

    }]);
