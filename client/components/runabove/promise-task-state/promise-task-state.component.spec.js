"use strict";

describe("Component: promiseTaskState", function () {

    var $compile;
    var $componentController;
    var cloudStorageContainerTasksRunner;
    var scope;

    var spyCountTotalTask;
    var spyCountPendingTask;
    var spyCountRunningTask;
    var spyCountDoneTask;
    var spyCountErrorTask;

    beforeEach(module("managerAppMock"));

    beforeEach(inject([
        "$compile",
        "$componentController",
        "$rootScope",
        "CloudStorageContainerTasksRunner", function (
            _$compile, _$componentController, _$rootScope,
            _cloudStorageContainerTasksRunner) {
                $compile = _$compile;
                $componentController = _$componentController;
                cloudStorageContainerTasksRunner = _cloudStorageContainerTasksRunner;
                scope = _$rootScope.$new();
            }]));

    beforeEach(function () {
        spyCountTotalTask = spyOn(cloudStorageContainerTasksRunner, "countTotalTasks");
        spyCountPendingTask = spyOn(cloudStorageContainerTasksRunner, "countPendingTasks");
        spyCountRunningTask = spyOn(cloudStorageContainerTasksRunner, "countRunningTasks");
        spyCountDoneTask = spyOn(cloudStorageContainerTasksRunner, "countDoneTasks");
        spyCountErrorTask = spyOn(cloudStorageContainerTasksRunner, "countErrorTasks");
    });

    describe("Controller", function () {
        it("should return right counter values", function () {
            var component = $componentController("promiseTaskState");

            setupCounterMock(5, 0, 0, 0);
            validateGlobalProgress(component, 100, 0, 0);
            expect(component.sumTasks()).toEqual(5);

            setupCounterMock(5, 3, 0, 0);
            validateGlobalProgress(component, 100, 0, 0);
            expect(component.sumTasks()).toEqual(5);

            setupCounterMock(4, 2, 1, 0);
            validateGlobalProgress(component, 80, 20, 0);
            expect(component.sumTasks()).toEqual(5);

            setupCounterMock(4, 3, 1, 0);
            validateGlobalProgress(component, 80, 20, 0);
            expect(component.sumTasks()).toEqual(5);

            setupCounterMock(3, 3, 1, 1);
            validateGlobalProgress(component, 60, 20, 20);
            expect(component.sumTasks()).toEqual(5);

            setupCounterMock(0, 0, 3, 2);
            validateGlobalProgress(component, 0, 60, 40);
            expect(component.sumTasks()).toEqual(5);
        });
    });

    describe("Template", function () {
        it("should render the component", function () {
            var elt = getElement(scope)[0];
            expect(elt).toBeDefined();

            expect(elt.querySelectorAll(".promise-task-state").length).toEqual(0);

            setupCounterMock(5, 0, 0, 0);
            scope.$digest();
            expect(elt.querySelectorAll(".promise-task-state").length).toEqual(1);

            var successBar = elt.querySelectorAll(".progress-bar-success");
            expect(successBar.length).toEqual(1);
            successBar = successBar[0];

            var errorBar = elt.querySelectorAll(".progress-bar-danger");
            expect(errorBar.length).toEqual(1);
            errorBar = errorBar[0];

            expect(successBar.style.width).toEqual("0%");
            expect(errorBar.style.width).toEqual("0%");


            setupCounterMock(4, 0, 1, 0);
            scope.$digest();
            expect(successBar.style.width).toEqual("20%");
            expect(errorBar.style.width).toEqual("0%");

            setupCounterMock(3, 0, 1, 1);
            scope.$digest();
            expect(successBar.style.width).toEqual("20%");
            expect(errorBar.style.width).toEqual("20%");

            setupCounterMock(0, 0, 4, 1);
            scope.$digest();
            expect(successBar.style.width).toEqual("80%");
            expect(errorBar.style.width).toEqual("20%");

            setupCounterMock(0, 0, 5, 0);
            scope.$digest();
            expect(successBar.style.width).toEqual("100%");
            expect(errorBar.style.width).toEqual("0%");
        });
    });

    function getElement(scope) {
        var elem = angular.element("<promise-task-state></promise-task-state>");
        var compiled = $compile(elem)(scope);
        scope.$digest();
        return compiled;
    }

    function validateGlobalProgress(component, pending, done, error) {
        expect(component.getGlobalProgress("pending")).toEqual(pending);
        expect(component.getGlobalProgress("done")).toEqual(done);
        expect(component.getGlobalProgress("error")).toEqual(error);
    }

    function validateProgressBarStyle(component, pending, done, error) {
        expect(component.getGlobalProgress("pending")).toEqual(pending);
        expect(component.getGlobalProgress("done")).toEqual(done);
        expect(component.getGlobalProgress("error")).toEqual(error);
    }

    function setupCounterMock(pending, running, success, error) {
        spyCountTotalTask.and.returnValue(pending + success + error);
        spyCountPendingTask.and.returnValue(pending);
        spyCountRunningTask.and.returnValue(running);
        spyCountDoneTask.and.returnValue(success);
        spyCountErrorTask.and.returnValue(error);
    }

});
