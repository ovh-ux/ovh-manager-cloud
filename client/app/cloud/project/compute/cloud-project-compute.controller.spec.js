"use strict";

describe("Controller: CloudProjectComputeCtrl", function () {

    var $httpBackend;
    var $controller;
    var scope;
    var CloudProjectInstanceLexi;
    var CloudUserPref;
    var OvhApiCloudProjectIpLexi;
    var $q;
    var CLOUD_PROJECT_OVERVIEW_THRESHOLD;
    var stateParams = {
        projectId: "id"
    };

    // load the controller"s module
    beforeEach(module("managerAppMock"));

    beforeEach(inject(function (_$httpBackend_, _$controller_, _$rootScope_, _OvhApiCloudProjectInstanceLexi_,
                                _$q_, _CLOUD_PROJECT_OVERVIEW_THRESHOLD_, _OvhApiCloudProjectIpLexi_, _CloudUserPref_) {
        $httpBackend = _$httpBackend_;
        $controller = _$controller_;
        scope = _$rootScope_.$new();
        $q = _$q_;
        OvhApiCloudProjectIpLexi = _OvhApiCloudProjectIpLexi_;
        CloudUserPref = _CloudUserPref_;
        CLOUD_PROJECT_OVERVIEW_THRESHOLD = _CLOUD_PROJECT_OVERVIEW_THRESHOLD_;
        CloudProjectInstanceLexi = _OvhApiCloudProjectInstanceLexi_;

    }));

    afterEach(inject(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    }));

    var controller;

    function initNewCtrl() {
        controller = $controller("CloudProjectComputeCtrl", {
            $scope: scope,
            $stateParams: stateParams
        });
        controller.init();
    }

    describe("initialization", function () {
        describe("project contains more instances than overview threshold", function () {

            beforeEach(function() {
                var instanceArray = [];
                instanceArray.length = CLOUD_PROJECT_OVERVIEW_THRESHOLD.instances + 1;
                spyOn(CloudProjectInstanceLexi, "query").and.returnValue({
                    $promise: $q.when(instanceArray)
                });
                spyOn(CloudUserPref, "get").and.returnValue($q.when({ hide: false }));
            });

            describe("project contains less or equals than overview threshold ips", function() {

                beforeEach(function () {
                    var ipArray = [];
                    ipArray.length = CLOUD_PROJECT_OVERVIEW_THRESHOLD.ips;
                    spyOn(OvhApiCloudProjectIpLexi, "query").and.returnValue({
                        $promise: $q.when(ipArray)
                    });
                });

                it("should put scope variable 'redirectToOverview' to true", function () {
                    initNewCtrl();
                    $httpBackend.flush();
                    expect(scope.redirectToOverview).toEqual(true);
                });
            });

            describe("project contains more than overview threshold ips", function() {

                beforeEach(function () {
                    var ipArray = [];
                    ipArray.length = CLOUD_PROJECT_OVERVIEW_THRESHOLD.ips + 1;
                    spyOn(OvhApiCloudProjectIpLexi, "query").and.returnValue({
                        $promise: $q.when(ipArray)
                    });
                });

                it("should put scope variable 'redirectToOverview' to true", function () {
                    initNewCtrl();
                    $httpBackend.flush();
                    expect(scope.redirectToOverview).toEqual(true);
                });
            });
        });

        describe("project contains more instances than overview threshold but user don't want to see overview anymore", function () {

            beforeEach(function() {
                var instanceArray = [];
                instanceArray.length = CLOUD_PROJECT_OVERVIEW_THRESHOLD.instances + 1;
                spyOn(CloudProjectInstanceLexi, "query").and.returnValue({
                    $promise: $q.when(instanceArray)
                });
                spyOn(CloudUserPref, "get").and.returnValue($q.when({ hide: true }));
            });

            describe("project contains more than overview threshold ips", function() {

                beforeEach(function () {
                    var ipArray = [];
                    ipArray.length = CLOUD_PROJECT_OVERVIEW_THRESHOLD.ips + 1;
                    spyOn(OvhApiCloudProjectIpLexi, "query").and.returnValue({
                        $promise: $q.when(ipArray)
                    });
                });

                it("should put scope variable 'redirectToOverview' to false", function () {
                    initNewCtrl();
                    $httpBackend.flush();
                    expect(scope.redirectToOverview).toEqual(false);
                });
            });
        });

        describe("project contains less or equals than overview threshold instances", function () {

            beforeEach(function() {
                var instanceArray = [];
                instanceArray.length = CLOUD_PROJECT_OVERVIEW_THRESHOLD.instances;
                spyOn(CloudProjectInstanceLexi, "query").and.returnValue({
                    $promise: $q.when(instanceArray)
                });
                spyOn(CloudUserPref, "get").and.returnValue($q.when({}));
            });

            describe("project contains less or equals than overview threshold ips", function() {

                beforeEach(function() {
                    var ipArray = [];
                    ipArray.length = CLOUD_PROJECT_OVERVIEW_THRESHOLD.ips;
                    spyOn(OvhApiCloudProjectIpLexi, "query").and.returnValue({
                        $promise: $q.when(ipArray)
                    });
                });

                it("should put scope variable 'redirectToOverview' to false", function () {
                    initNewCtrl();
                    $httpBackend.flush();
                    expect(scope.redirectToOverview).toEqual(false);
                });
            });

            describe("project contains more than overview threshold ips", function() {

                beforeEach(function() {
                    var ipArray = [];
                    ipArray.length = CLOUD_PROJECT_OVERVIEW_THRESHOLD.ips + 1;
                    spyOn(OvhApiCloudProjectIpLexi, "query").and.returnValue({
                        $promise: $q.when(ipArray)
                    });
                });

                it("should put scope variable 'redirectToOverview' to true", function () {
                    initNewCtrl();
                    $httpBackend.flush();
                    expect(scope.redirectToOverview).toEqual(true);
                });
            });
        });
    });
});
