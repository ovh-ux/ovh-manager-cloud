"use strict";

describe("Controller: CloudProjectDetailsCtrl", function () {

    var $httpBackend;
    var $controller;
    var scope;
    var $rootScope;
    var $q;
    var CloudProjectMock;
    var ToastMock;
    var $translateMock;
    var $stateMock;

    var projectId = "test";

    // load the controller"s module
    beforeEach(module("managerAppMock"));

    beforeEach(inject(function (_$httpBackend_, _$rootScope_, _$controller_, _$q_) {
        $httpBackend = _$httpBackend_;
        $controller = _$controller_;
        scope = _$rootScope_.$new();
        $rootScope = _$rootScope_;
        $q = _$q_;
        ToastMock = {
            success: jasmine.createSpy("success"),
            error: jasmine.createSpy("error")
        };
        $translateMock = {
            instant: jasmine.createSpy("instant")
        };
        $stateMock = {
            go: jasmine.createSpy("instant")
        };

    }));

    afterEach(inject(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
        scope.$destroy();
    }));

    var controller;

    function initNewCtrl () {
        controller = $controller("CloudProjectDetailsCtrl", {
            $scope: scope,
            $rootScope: $rootScope,
            $stateParams: { projectId: projectId },
            OvhApiCloudProject: CloudProjectMock,
            Toast: ToastMock,
            $translate: $translateMock,
            $state: $stateMock
        });
    }

    describe("cancelProjectCreation", function () {
        beforeEach(function () {
            spyOn($rootScope, "$broadcast").and.returnValue(angular.noop);
        });

        it("should set loading variable until operation is complete", function () {
            mockApi(200, 200);
            initNewCtrl();
            expect(controller.loaders.cancelCreation).toEqual(false);

            controller.cancelProjectCreation();
            expect(controller.loaders.cancelCreation).toEqual(true);
            $httpBackend.flush();
            expect(controller.loaders.cancelCreation).toEqual(false);
        });

        it("should open success toast on success", function () {
            mockApi(200, 200);
            initNewCtrl();

            controller.cancelProjectCreation();
            $httpBackend.flush();

            expect(ToastMock.success).toHaveBeenCalled();
        });

        it("should redirect to home on success", function () {
            mockApi(200, 200);
            initNewCtrl();

            controller.cancelProjectCreation();
            $httpBackend.flush();

            expect($stateMock.go).toHaveBeenCalledWith("home");
        });

        it("should refresh projects data on success", function () {
            mockApi(200, 200);
            initNewCtrl();

            controller.cancelProjectCreation();
            $httpBackend.flush();

            expect($rootScope.$broadcast).toHaveBeenCalledWith("sidebar_refresh_cloud");
        });

        it("should display specific message on 460 error status", function () {
            mockApi(200, 460);
            initNewCtrl();

            controller.cancelProjectCreation();
            $httpBackend.flush();

            expect($translateMock.instant).toHaveBeenCalledWith("cpd_project_cancel_error_expired_status");
        });

        it("should refresh projects data on 460 error status", function () {
            mockApi(200, 460);
            initNewCtrl();

            controller.cancelProjectCreation();
            $httpBackend.flush();

            expect($rootScope.$broadcast).toHaveBeenCalledWith("sidebar_refresh_cloud");
        });

        it("should refresh projects data on 401 error status", function () {
            mockApi(200, 401);
            initNewCtrl();

            controller.cancelProjectCreation();
            $httpBackend.flush();

            expect($rootScope.$broadcast).toHaveBeenCalledWith("sidebar_refresh_cloud");
        });

        it("should should not refresh projects data on other error status than 401 and 460", function () {
            mockApi(200, 500);
            initNewCtrl();

            controller.cancelProjectCreation();
            $httpBackend.flush();

            expect($rootScope.$broadcast).not.toHaveBeenCalledWith("sidebar_refresh_cloud");
        });

        it("should display specific message on 401 error status", function () {
            mockApi(200, 401);
            initNewCtrl();

            controller.cancelProjectCreation();
            $httpBackend.flush();

            expect($translateMock.instant).toHaveBeenCalledWith("cpd_project_cancel_error_ok_status");
        });
    });

    function mockApi (getStatus, cancelStatus) {
        var project = {
            status: "creating"
        };

        CloudProjectMock = {
            Lexi: function () {
                return {
                    get: function () {
                        return {
                            $promise: getStatus === 200 ? $q.when(project) : $q.reject(getStatus)
                        };
                    },
                    cancelCreation: function () {
                        return {
                            $promise: cancelStatus === 200 ? $q.when("ok") : $q.reject(cancelStatus)
                        };
                    }
                };
            }
        };
    }
});
