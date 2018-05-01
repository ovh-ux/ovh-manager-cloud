"use strict";

describe("Controller: CloudProjectComputeCtrl", function () {

    var $httpBackend;
    var $controller;
    var scope;
    var CloudProjectInstanceV6;
    var CloudUserPref;
    var OvhApiCloudProjectIpV6;
    var $q;
    var CLOUD_PROJECT_OVERVIEW_THRESHOLD;
    var stateParams = {
        projectId: "id"
    };

    // load the controller"s module
    beforeEach(module("managerAppMock"));

    beforeEach(inject(function (_$httpBackend_, _$controller_, _$rootScope_, _OvhApiCloudProjectInstanceV6_,
                                _$q_, _CLOUD_PROJECT_OVERVIEW_THRESHOLD_, _OvhApiCloudProjectIpV6_, _CloudUserPref_) {
        $httpBackend = _$httpBackend_;
        $controller = _$controller_;
        scope = _$rootScope_.$new();
        $q = _$q_;
        OvhApiCloudProjectIpV6 = _OvhApiCloudProjectIpV6_;
        CloudUserPref = _CloudUserPref_;
        CLOUD_PROJECT_OVERVIEW_THRESHOLD = _CLOUD_PROJECT_OVERVIEW_THRESHOLD_;
        CloudProjectInstanceV6 = _OvhApiCloudProjectInstanceV6_;

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
                spyOn(CloudProjectInstanceV6, "query").and.returnValue({
                    $promise: $q.when(instanceArray)
                });
                spyOn(CloudUserPref, "get").and.returnValue($q.when({ hide: false }));
            });

            describe("project contains less or equals than overview threshold ips", function() {

                beforeEach(function () {
                    var ipArray = [];
                    ipArray.length = CLOUD_PROJECT_OVERVIEW_THRESHOLD.ips;
                    spyOn(OvhApiCloudProjectIpV6, "query").and.returnValue({
                        $promise: $q.when(ipArray)
                    });
                });
            });

            describe("project contains more than overview threshold ips", function() {

                beforeEach(function () {
                    var ipArray = [];
                    ipArray.length = CLOUD_PROJECT_OVERVIEW_THRESHOLD.ips + 1;
                    spyOn(OvhApiCloudProjectIpV6, "query").and.returnValue({
                        $promise: $q.when(ipArray)
                    });
                });
            });
        });

        describe("project contains more instances than overview threshold but user don't want to see overview anymore", function () {

            beforeEach(function() {
                var instanceArray = [];
                instanceArray.length = CLOUD_PROJECT_OVERVIEW_THRESHOLD.instances + 1;
                spyOn(CloudProjectInstanceV6, "query").and.returnValue({
                    $promise: $q.when(instanceArray)
                });
                spyOn(CloudUserPref, "get").and.returnValue($q.when({ hide: true }));
            });

            describe("project contains more than overview threshold ips", function() {

                beforeEach(function () {
                    var ipArray = [];
                    ipArray.length = CLOUD_PROJECT_OVERVIEW_THRESHOLD.ips + 1;
                    spyOn(OvhApiCloudProjectIpV6, "query").and.returnValue({
                        $promise: $q.when(ipArray)
                    });
                });
            });
        });

        describe("project contains less or equals than overview threshold instances", function () {

            beforeEach(function() {
                var instanceArray = [];
                instanceArray.length = CLOUD_PROJECT_OVERVIEW_THRESHOLD.instances;
                spyOn(CloudProjectInstanceV6, "query").and.returnValue({
                    $promise: $q.when(instanceArray)
                });
                spyOn(CloudUserPref, "get").and.returnValue($q.when({}));
            });

            describe("project contains less or equals than overview threshold ips", function() {

                beforeEach(function() {
                    var ipArray = [];
                    ipArray.length = CLOUD_PROJECT_OVERVIEW_THRESHOLD.ips;
                    spyOn(OvhApiCloudProjectIpV6, "query").and.returnValue({
                        $promise: $q.when(ipArray)
                    });
                });
            });

            describe("project contains more than overview threshold ips", function() {

                beforeEach(function() {
                    var ipArray = [];
                    ipArray.length = CLOUD_PROJECT_OVERVIEW_THRESHOLD.ips + 1;
                    spyOn(OvhApiCloudProjectIpV6, "query").and.returnValue({
                        $promise: $q.when(ipArray)
                    });
                });
            });
        });
    });
});
