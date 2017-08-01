"use strict";

xdescribe("Service: CloudStorageContainerTasksRunner", function () {

    var $q;
    var $rootScope;
    var $timeout;
    var cloudStorageContainerTasksRunner;

    beforeEach(module("managerAppMock"));

    beforeEach(inject([
        "$q",
        "$rootScope",
        "$timeout",
        "CloudStorageContainerTasksRunner",
        function (
            _$q,
            _$rootScope,
            _$timeout,
            _cloudStorageContainerTasksRunner) {
            $q = _$q;
            $rootScope = _$rootScope;
            $timeout = _$timeout;
            cloudStorageContainerTasksRunner = _cloudStorageContainerTasksRunner;
        }]));

    beforeEach(function () {
        jasmine.clock().install();
        cloudStorageContainerTasksRunner.limit = 3;
    });

    afterEach(function () {
        cloudStorageContainerTasksRunner.flush();
        jasmine.clock().uninstall();
    });

    describe("Task runner", function () {
        it("should execute one promise", function (done) {
            var spy = jasmine.createSpy();

            cloudStorageContainerTasksRunner.enqueue("mainQueue", [
                    createFakeTask(10)
                ])
                .then(function (result) {
                    spy();
                    expect(result.success.length).toEqual(1);
                    expect(result.success[0]).toEqual("success");
                })
                .catch(function (error) {
                    expect(error).toBeUndefined();
                });

            validateCounters(1, 1, 1, 0, 0);

            $rootScope.$apply();

            $timeout.flush(5);
            validateCounters(1, 1, 1, 0, 0);

            $timeout.flush(6);
            validateCounters(1, 0, 0, 1, 0);

            expect(spy).toHaveBeenCalled();

            done();
        });

        it("should execute several promises", function () {
            var spy = jasmine.createSpy();
            var taskSpy = jasmine.createSpy();

            cloudStorageContainerTasksRunner.enqueue("mainQueue", [
                    createFakeTask(10),
                    createFakeTask(10),
                    createFakeTask(10)
                ])
                .then(function (result) {
                    spy();
                    expect(result.success.length).toEqual(3);
                })
                .catch(function (error) {
                    expect(error).toBeUndefined();
                });

            validateCounters(3, 3, 3, 0, 0);

            $timeout.flush(11);
            $rootScope.$apply();

            validateCounters(3, 0, 0, 3, 0);

            expect(spy).toHaveBeenCalled();

        });

        it("should not be rejected if one promise is rejected", function (done) {
            var spy = jasmine.createSpy();

            cloudStorageContainerTasksRunner.enqueue("mainQueue", [
                    createFakeTask(10),
                    createFakeTask(10, null, "ko")
                ])
                .then(function (result) {
                    spy();
                    expect(result.success.length).toEqual(1);
                    expect(result.error.length).toEqual(1);
                })
                .catch(function (error) {
                    expect(error).toBeUndefined();
                });

            validateCounters(2, 2, 2, 0, 0);

            $timeout.flush(11);
            $rootScope.$apply();

            validateCounters(2, 0, 0, 1, 1);

            expect(spy).toHaveBeenCalled();

            done();
        });

        it("should respect the concurrency limit", function (done) {
            var taskSpy = jasmine.createSpy();

            cloudStorageContainerTasksRunner.enqueue("mainQueue", [
                    createFakeTask(10),
                    createFakeTask(10),
                    createFakeTask(10),
                    createFakeTask(10),
                    createFakeTask(10),
                    createFakeTask(10)
                ])
                .catch(function (error) {
                    expect(error).toBeUndefined();
                });

            $rootScope.$on("cloudStorageContainerTasksRunner:finish_task", taskSpy);

            $rootScope.$apply();

            $timeout.flush(5);
            validateCounters(6, 6, 3, 0, 0);

            $timeout.flush(6);
            validateCounters(6, 3, 3, 3, 0);
            expect(taskSpy.calls.count()).toEqual(3);

            $timeout.flush(11);
            validateCounters(6, 0, 0, 6, 0);
            expect(taskSpy.calls.count()).toEqual(6);

            done();
        });

        it("should be updated when a task is added", function (done) {
            var taskSpy = jasmine.createSpy();

            cloudStorageContainerTasksRunner.enqueue([
                    createFakeTask(10, "call1"),
                    createFakeTask(11, "call2"),
                    createFakeTask(12, "call3")
                ])
                .catch(function (error) {
                    expect(error).toBeUndefined();
                });

            $rootScope.$on("cloudStorageContainerTasksRunner:finish_task", taskSpy);

            $rootScope.$apply();

            $timeout.flush(5);
            validateCounters(3, 3, 3, 0, 0);
            expect(taskSpy.calls.count()).toEqual(0);
            expect(cloudStorageContainerTasksRunner.getQueues().main.running).toEqual(3);

            cloudStorageContainerTasksRunner.addTask(createFakeTask(10, "call4"));
            $timeout.flush(8);
            validateCounters(4, 1, 1, 3, 0);
            expect(taskSpy.calls.count()).toEqual(3);
            expect(cloudStorageContainerTasksRunner.getQueues().main.running).toEqual(1);

            $timeout.flush(10);
            validateCounters(4, 0, 0, 4, 0);
            expect(taskSpy.calls.count()).toEqual(4);

            done();
        });

        it("should flush tasks on addTask when all is finish or in error", function (done) {
            var taskSpy = jasmine.createSpy();

            cloudStorageContainerTasksRunner.enqueue([
                    createFakeTask(10, "call1"),
                    createFakeTask(11, "call2", "fail2"),
                    createFakeTask(12, "call3"),
                    createFakeTask(12, "call4"),
                    createFakeTask(12, "call5")
                ])
                .catch(function (error) {
                    expect(error).toBeUndefined();
                });

            $rootScope.$on("cloudStorageContainerTasksRunner:finish_task", taskSpy);

            $rootScope.$apply();

            $timeout.flush(12);
            validateCounters(5, 2, 2, 2, 1);
            expect(taskSpy.calls.count()).toEqual(3);

            cloudStorageContainerTasksRunner.addTask(createFakeTask(10, "call6"));
            $timeout.flush(20);
            validateCounters(6, 0, 0, 5, 1);
            expect(taskSpy.calls.count()).toEqual(6);

            cloudStorageContainerTasksRunner.addTask(createFakeTask(10, "call7"));
            $timeout.flush(5);
            validateCounters(1, 1, 1, 0, 0);
            expect(taskSpy.calls.count()).toEqual(6);

            done();
        });
    });

    function createFakeTask (delay, success, error) {
        var func = function () {
            var deferred = $q.defer();
            $timeout(function () {
                if (error) {
                    deferred.reject(error);
                    return;
                }
                deferred.resolve(success || "success");
            }, delay);
            return deferred.promise;
        };
        func.successMessage = success;
        return func;
    }

    function validateCounters (total, pending, running, success, error) {
        expect(cloudStorageContainerTasksRunner.countTotalTasks()).toEqual(total, "total");
        expect(cloudStorageContainerTasksRunner.countPendingTasks()).toEqual(pending, "pending");
        expect(cloudStorageContainerTasksRunner.countRunningTasks()).toEqual(running, "running");
        expect(cloudStorageContainerTasksRunner.countDoneTasks()).toEqual(success, "success");
        expect(cloudStorageContainerTasksRunner.countErrorTasks()).toEqual(error, "error");
    }

});
