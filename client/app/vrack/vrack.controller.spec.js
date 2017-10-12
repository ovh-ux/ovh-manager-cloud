describe("Controller: VrackCtrl", function () {

    var $httpBackend;
    var $controller;
    var scope;
    var $rootScope;
    var CloudMessageMock;
    var $translateMock;
    var $stateMock;

    var servicesRequestHandle;
    var allowedServicesRequestHandle;
    var dataTestServices = { "ip": ["", ""], "dedicatedServer": ["", ""], "dedicatedCloud": ["", ""], "legacyVrack": ["", ""], "cloudProject": ["test", ""] };
    var dataTestAllowedServices = { "ip": ["", ""], "dedicatedServer": ["", ""], "dedicatedCloud": ["", ""], "legacyVrack": ["", ""], "cloudProject": ["test", ""] };

    // load the controller"s module
    beforeEach(module("managerAppMock"));

    beforeEach(inject(function (_$httpBackend_, _$rootScope_, _$controller_) {
        $httpBackend = _$httpBackend_;
        $controller = _$controller_;
        scope = _$rootScope_.$new();
        $rootScope = _$rootScope_;
        CloudMessageMock = {
            unSubscribe: jasmine.createSpy("unSubscribe"),
            subscribe: jasmine.createSpy("subscribe"),
            success: jasmine.createSpy("success"),
            error: jasmine.createSpy("error")
        };
        $translateMock = {
            instant: jasmine.createSpy("instant")
        };
        $stateMock = {
            go: jasmine.createSpy("go")
        };
        $httpBackend.whenGET(/\/cloud\/project$/g).respond(200, ["test", "test"]);
        $httpBackend.whenGET(/\/cloud\/project\/test$/g).respond(200, { description: "the description", project_id: "test" });
        $httpBackend.whenGET(/\/vrack\/testProject$/g).respond(200, {});
        $httpBackend.whenGET(/\/vrack\/testProject\/task$/g).respond(200, []);
        servicesRequestHandle = $httpBackend.whenGET(/\/vrack\/testProject\/services$/g).respond(200, dataTestServices);
        allowedServicesRequestHandle = $httpBackend.whenGET(/\/vrack\/testProject\/allowedServices$/g).respond(200, dataTestAllowedServices);

        initNewCtrl();
        $httpBackend.flush();
    }));

    afterEach(inject(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
        scope.$destroy();
    }));

    var controller;

    function initNewCtrl () {
        controller = $controller("VrackCtrl", {
            $scope: scope,
            $rootScope: $rootScope,
            CloudMessage: CloudMessageMock,
            $translate: $translateMock,
            $state: $stateMock,
            $stateParams: { vrackId: "testProject" }
        });
    }

    function getNumberOfService (services) {
        var serviceTypes = ["dedicatedServer", "dedicatedCloud", "legacyVrack", "ip", "cloudProject"];
        var numberOfProducts = 0;
        _.forEach(serviceTypes, function (serviceType) {
            if (services[serviceType]) {
                numberOfProducts += services[serviceType].length;
            }
        });
        return numberOfProducts;
    }

    describe("Test func getDisplayName.", function () {
        it("Get the display name for a specific type.", function () {

            controller.getDisplayName("dedicatedServer");
            expect($translateMock.instant).toHaveBeenCalledWith("vrack_service_type_dedicatedserver");

            controller.getDisplayName("dedicatedCloud");
            expect($translateMock.instant).toHaveBeenCalledWith("vrack_service_type_dedicatedcloud");

            controller.getDisplayName("dedicatedConnect");
            expect($translateMock.instant).toHaveBeenCalledWith("vrack_service_type_dedicatedconnect");

            controller.getDisplayName("legacyVrack");
            expect($translateMock.instant).toHaveBeenCalledWith("vrack_service_type_legacyvrack");

            controller.getDisplayName("ip");
            expect($translateMock.instant).toHaveBeenCalledWith("vrack_service_type_ip");

            controller.getDisplayName("cloudProject");
            expect($translateMock.instant).toHaveBeenCalledWith("vrack_service_type_cloudproject");

        });
    });

    describe("Test the functions that get the services.", function () {
        xit("Get all the services allowed.", function () {
            controller.getAllowedServices().then(function (services) {
                expect(getNumberOfService(services)).toBe(12);
            });
        });
        it("Get all the services for a specific vrack.", function () {
            controller.getVrackServices().then(function (services) {
                expect(getNumberOfService(services)).toBe(10);
            });
        });
    });

    describe("Test error handling (CloudMessage)", function () {
        it("addSelectedServices error.", function () {
            $httpBackend.whenPOST(/\/vrack\/testProject\/test\/cloudProject?project=projectTest$/g).respond(418, null);
            $httpBackend.whenPOST(/\/vrack\/testProject\/cloudProject$/g).respond(418, null);

            controller.form.servicesToAdd.push({ type: "cloudProject", id: "test" });
            controller.addSelectedServices();
            $httpBackend.flush();
            expect(CloudMessageMock.error).toHaveBeenCalled();
        });

        it("deleteSelectedServices error.", function () {
            $httpBackend.whenDELETE(/\/testProject\/cloudProject\/test$/g).respond(418, null);
            controller.form.servicesToDelete.push({ type: "cloudProject", id: "test" });
            controller.deleteSelectedServices();
            $httpBackend.flush();
            expect(CloudMessageMock.error).toHaveBeenCalled();

        });
    });
});
