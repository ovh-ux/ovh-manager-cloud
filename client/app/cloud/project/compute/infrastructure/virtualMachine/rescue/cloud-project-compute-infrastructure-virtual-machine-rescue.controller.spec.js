"use strict";

describe("Controller: CloudProjectComputeInfrastructureVirtualmachineRescueCtrl", function () {
    var $controller;
    var scope;

    beforeEach(angular.mock.module("managerAppMock"));

    beforeEach(inject(function (_$controller_, _$rootScope_) {
        $controller = _$controller_;
        scope = _$rootScope_.$new();
    }));

    describe(".isNonRescuableWithDefaultImage", function () {
        var vm;
        var controller;

        beforeEach(function () {
            vm = { image: {} };
            controller = $controller("CloudProjectComputeInfrastructureVirtualmachineRescueCtrl", {
                $scope: scope,
                $uibModalInstance: {},
                params: {}
            });
        });

        it("returns false if the distro is rescuable by the default image.", function () {
            vm.image = { type: "linux", distribution: "ubuntu" };
            expect(controller.isNonRescuableWithDefaultImage(vm)).toBe(false);
        });

        it("returns false if the distro is an other-linux distro but not a bsd-family one.", function () {
            vm.image = { type: "linux", distribution: "coreos", nameGeneric: "core_os_release_x" };
            expect(controller.isNonRescuableWithDefaultImage(vm)).toBe(false);
        });

        it("returns true in a freebsd distro case.", function () {
            vm.image = { type: "linux", distribution: "freebsd", nameGeneric: "freebsd_release_x" };
            expect(controller.isNonRescuableWithDefaultImage(vm)).toBe(true);
        });

        it("returns true in a windows-family operating system case.", function () {
            vm.image = { type: "windows" };
            expect(controller.isNonRescuableWithDefaultImage(vm)).toBe(true);
        });
    });
});
