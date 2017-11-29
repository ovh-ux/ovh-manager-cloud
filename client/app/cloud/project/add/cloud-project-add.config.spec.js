describe("Controller config: CloudProjectAddCtrl", () => {

    let controller;
    let util;


    beforeEach(module("managerAppMock"));

    beforeEach(inject((controllerTestUtil, _atInternet_, $httpBackend) => {
        util = controllerTestUtil;
        spyOn(_atInternet_, "trackClick");
        controller = util.createController("CloudProjectAddCtrl");
        $httpBackend.whenGET(/api(?:v6)?\/me/).respond(200, {});
        $httpBackend.whenPOST(/api(?:v6)?\/me/).respond(200, {});
        $httpBackend.whenGET(/api(?:v6)?\/cloud/).respond(200, {});
        $httpBackend.whenPOST(/api(?:v6)?\/cloud/).respond(200, {});
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
