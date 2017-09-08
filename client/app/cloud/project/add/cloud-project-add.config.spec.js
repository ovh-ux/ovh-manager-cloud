describe("Controller config: CloudProjectAddCtrl", () => {

    let controller;
    let util;


    beforeEach(module("managerAppMock"));

    beforeEach(inject((controllerTestUtil, _atInternet_) => {
        util = controllerTestUtil;
        spyOn(_atInternet_, "trackClick");
        controller = util.createController("CloudProjectAddCtrl");
    }));

    afterEach(inject(() => {
        util.verifyHttpBackend();
    }));

    describe("atInternet track Click on Cloud Project activation", () => {
        it("should track click on project creation when activation is set", inject(($httpBackend, atInternet) => {
            controller.model = { contractsAccepted: true };
            controller.data = { agreements: [{}] };

            controller.createProject();
            $httpBackend.flush();

            expect(atInternet.trackClick).toHaveBeenCalledWith({
                name: "AccountActivation",
                type: "action"
            });
        }));
    });

    describe("atInternet track Click on Cloud Project already activated", () => {
        it("should not track click on project creation if agreements is empty", inject(($httpBackend, atInternet) => {
            controller.model = { contractsAccepted: true };
            controller.data = { agreements: [] };

            controller.createProject();
            $httpBackend.flush();

            expect(atInternet.trackClick).not.toHaveBeenCalled();
        }));
    });
});
