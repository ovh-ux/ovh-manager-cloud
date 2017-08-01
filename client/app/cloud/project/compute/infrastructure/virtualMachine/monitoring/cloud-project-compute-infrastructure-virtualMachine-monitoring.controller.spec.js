"use strict";

describe("Controller CloudProjectComputeInfrastructureVirtualMachineMonitoringCtrl - ", function () {

    var $httpBackend,
        $controller,
        scope,
        $rootScope,
        $timeoutMock,
        $q,
        CloudProjectComputeInfrastructureOrchestrator;

    var vm;

    // load the controller"s module
    beforeEach(module("managerAppMock"));

    beforeEach(inject(function (_$httpBackend_, _$rootScope_, _$controller_, _CloudProjectComputeInfrastructureOrchestrator_, _$q_) {
        $httpBackend = _$httpBackend_;
        $controller = _$controller_;
        scope = _$rootScope_.$new();
        $rootScope = _$rootScope_;
        $timeoutMock = function(toExecute) {
            toExecute();
        } ;
        $q = _$q_;
        CloudProjectComputeInfrastructureOrchestrator = _CloudProjectComputeInfrastructureOrchestrator_;
        $rootScope.$broadcast = angular.noop;

        vm = {
            id : "testId",
            flavor : {
                mem : 100,
                inboundBandwidth: 100,
                outboundBandwidth: 100
            },
            getMonitoringData: getNeedUpgradeMonitoringData
        };
        mockDependencies();
    }));

    afterEach(inject(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
        scope.$destroy();
    }));

    var controller;

    function initNewCtrl() {
        controller = $controller("CloudProjectComputeInfrastructureVirtualMachineMonitoringCtrl", {
            $scope: scope,
            $timeout: $timeoutMock
        });
    }

    describe("initialization", function () {
        it("should retrieve monitored vm", function () {
            initNewCtrl();
            $httpBackend.flush();
            expect(CloudProjectComputeInfrastructureOrchestrator.getMonitoredVm).toHaveBeenCalled();
        });


        it("should send highlighed-element.show event", function () {
            initNewCtrl();
            $httpBackend.flush();
            expect($rootScope.$broadcast).toHaveBeenCalledWith("highlighed-element.show", "compute," + vm.id);
        });

        it("should compute CPU max value for period", function() {
            vm.getMonitoringData = getNeedUpgradeMonitoringData;
            initNewCtrl();
            $httpBackend.flush();

            expect(controller.dataPeriod.cpu.max).toEqual(90);
        });

        it("should compute CPU needUpgrade", function() {
            vm.getMonitoringData = getNeedUpgradeMonitoringData;
            initNewCtrl();
            $httpBackend.flush();

            expect(controller.dataPeriod.cpu.needUpgrade).toEqual(true);
        });

        it("should compute MEM max value for period", function() {
            vm.getMonitoringData = getNeedUpgradeMonitoringData;
            initNewCtrl();
            $httpBackend.flush();

            expect(controller.dataPeriod.mem.max).toEqual(100);
        });

        it("should compute MEM needUpgrade", function() {
            vm.getMonitoringData = getNeedUpgradeMonitoringData;
            initNewCtrl();
            $httpBackend.flush();

            expect(controller.dataPeriod.mem.needUpgrade).toEqual(true);
        });

        it("should compute net up max value for period", function() {
            vm.getMonitoringData = getNeedUpgradeMonitoringData;
            initNewCtrl();
            $httpBackend.flush();

            expect(controller.dataPeriod.net.up.max).toEqual(90);
        });

        it("should compute net up needUpgrade", function() {
            vm.getMonitoringData = getNeedUpgradeMonitoringData;
            initNewCtrl();
            $httpBackend.flush();

            expect(controller.dataPeriod.net.up.needUpgrade).toEqual(true);
        });

        it("should deploy CPU accordeon if needUpgrade", function() {
            vm.getMonitoringData = getNeedUpgradeMonitoringData;
            initNewCtrl();
            $httpBackend.flush();

            expect(controller.accordions.cpu).toEqual(true);
        });

        it("should deploy MEM accordeon if needUpgrade", function() {
            vm.getMonitoringData = getNeedUpgradeMonitoringData;
            initNewCtrl();
            $httpBackend.flush();

            expect(controller.accordions.mem).toEqual(true);
        });

        it("should deploy CPU accordeon if needUpgrade", function() {
            vm.getMonitoringData = getNeedUpgradeMonitoringData;
            initNewCtrl();
            $httpBackend.flush();

            expect(controller.accordions.net).toEqual(true);
        });

        it("should update chart data to the right scale", function() {
            vm.getMonitoringData = getNeedUpgradeMonitoringData;
            initNewCtrl();
            $httpBackend.flush();

            expect(controller.chartData["net:tx"].unit).toEqual("mb/s");
            expect(controller.chartData["net:tx"].data[0].value).toEqual(50);
        });
    });

    function mockDependencies() {
        spyOn($rootScope, "$broadcast").and.returnValue(angular.noop);
        spyOn(CloudProjectComputeInfrastructureOrchestrator, "getMonitoredVm").and.returnValue(vm);
    }

    function getNeedUpgradeMonitoringData() {
        var value50 = { value : 50 };
        var value90 = { value : 90 };
        var value50net = { value : 50 * 1000000 };
        var value90net = { value : 90 * 1000000 };
        vm.monitoringData = {
            cpu: {
                needUpgrade: true,
                now : 50
            },
            mem: {
                needUpgrade: true,
                now : 50
            },
            net: {
                needUpgrade: true,
                now : {
                    up : {
                        value : 50
                    },
                    down: {
                        value : 50
                    }
                }
            },
            raw : {
                "cpu:max": {
                   values : [value50, value50, value90]
                },
                "cpu:used": {
                    values : [value50, value50, value90]
                },
                "mem:max": {
                    values : [value50, value50, value90]
                },
                "mem:used": {
                    values : [value50, value50, value90]
                },
                "net:rx": {
                    values : [value50net, value50net, value90net],
                    unit: "b/s"
                },
                "net:tx": {
                    values : [value50net, value50net, value90net],
                    unit: "b/s"
                }
            }
        };

        return $q.when(1);
    }
});
