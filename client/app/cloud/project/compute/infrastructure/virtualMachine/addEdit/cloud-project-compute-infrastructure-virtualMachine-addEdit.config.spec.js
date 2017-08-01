"use strict";

describe("Controller config: CloudProjectComputeInfrastructureVirtualMachineAddEditCtrl", function () {

    var controller;
    var util;

    var PAGE_NAME = "cloud-project::cloud-project-compute::cloud-project-compute-infrastructure-order";
    var OVER_QUOTA_LOW = "over-quota-low";
    var OVER_QUOTA_HIGH = "over-quota-high";

    beforeEach(module("managerAppMock"));

    beforeEach(inject(function (controllerTestUtil, _atInternet_) {
        util = controllerTestUtil;
        spyOn(_atInternet_, "trackEvent");
        controller = util.createController("CloudProjectComputeInfrastructureVirtualMachineAddEditCtrl");
    }));

    afterEach(inject(function () {
        util.verifyHttpBackend();
    }));

    describe("atInternet over quota low event", function () {

        it("should track over-quota-low event when flavor is disabled for cpu quota reason", inject(function ($httpBackend,atInternet) {
            controller.displayData.categories = [{
                category: "vps",
                flavors: [{ disabled: "QUOTA_VCPUS" }]
            }];

            controller.viewFlavorsList("", "vps");
            $httpBackend.flush();

            expect(atInternet.trackEvent).toHaveBeenCalledWith({
                event: OVER_QUOTA_LOW,
                page: PAGE_NAME
            });
        }));

        it("should track over-quota-low event when flavor is disabled for ram quota reason", inject(function ($httpBackend, atInternet) {
            controller.displayData.categories = [{
                category: "vps",
                flavors: [{ disabled: "QUOTA_RAM" }]
            }];

            controller.viewFlavorsList("", "vps");
            $httpBackend.flush();

            expect(atInternet.trackEvent).toHaveBeenCalledWith({
                event: OVER_QUOTA_LOW,
                page: PAGE_NAME
            });
        }));

        it("should track over-quota-low event when flavor is disabled for instance quota reason", inject(function ($httpBackend, atInternet) {
            controller.displayData.categories = [{
                category: "vps",
                flavors: [{ disabled: "QUOTA_INSTANCE" }]
            }];

            controller.viewFlavorsList("", "vps");
            $httpBackend.flush();

            expect(atInternet.trackEvent).toHaveBeenCalledWith({
                event: OVER_QUOTA_LOW,
                page: PAGE_NAME
            });
        }));

        it("should not track event when flavor is disabled for a reason other than quota", inject(function ($httpBackend, atInternet) {
            controller.displayData.categories = [{
                category: "vps",
                flavors: [{ disabled: "NOT_QUOTA_REASON" }]
            }];

            controller.viewFlavorsList("", "vps");
            $httpBackend.flush();

            expect(atInternet.trackEvent).not.toHaveBeenCalled();
        }));
    });

    describe("atInternet over quota high event", function () {
        it("should track over-quota-high event when mouse enter in disabled flavor for cpu quota reason", inject(function ($httpBackend, atInternet) {
            var flavor = { disabled: "QUOTA_VCPUS" };

            controller.onMouseEnterFlavor("", flavor);
            $httpBackend.flush();

            expect(atInternet.trackEvent).toHaveBeenCalledWith({
                event: OVER_QUOTA_HIGH,
                page: PAGE_NAME
            });
        }));

        it("should track over-quota-high event when mouse enter in disabled flavor for ram quota reason", inject(function ($httpBackend, atInternet) {
            var flavor = { disabled: "QUOTA_RAM" };

            controller.onMouseEnterFlavor("", flavor);
            $httpBackend.flush();

            expect(atInternet.trackEvent).toHaveBeenCalledWith({
                event: OVER_QUOTA_HIGH,
                page: PAGE_NAME
            });
        }));

        it("should track over-quota-high event when mouse enter in disabled flavor for instance quota reason", inject(function ($httpBackend, atInternet) {
            var flavor = { disabled: "QUOTA_INSTANCE" };

            controller.onMouseEnterFlavor("", flavor);
            $httpBackend.flush();

            expect(atInternet.trackEvent).toHaveBeenCalledWith({
                event: OVER_QUOTA_HIGH,
                page: PAGE_NAME
            });
        }));

        it("should not track over-quota-high event when mouse enter in disabled flavor for a reason other than quota", inject(function ($httpBackend, atInternet) {
            var flavor = { disabled: "NOT_QUOTA_REASON" };

            controller.onMouseEnterFlavor("", flavor);
            $httpBackend.flush();

            expect(atInternet.trackEvent).not.toHaveBeenCalled();
        }));
    });
});
