describe("Controller: Veeam detail", () => {
    let $q;
    let $scope;

    let VeeamDetailCtrl;
    let VeeamService;

    // load the controller"s module
    beforeEach(module("managerAppMock"));

    // Initialize the controller and a mock scope
    beforeEach(inject(($controller, _$q_, $rootScope, _VeeamService_) => {
        $q = _$q_;
        VeeamService = _VeeamService_;

        $scope = $rootScope.$new();
        VeeamDetailCtrl = $controller("VeeamDetailCtrl", {
            $scope
        });

        setupVeeamServiceMocks();
    }));

    it("should have initial values", () => {
        VeeamDetailCtrl.$onInit();
        expect(VeeamDetailCtrl.pendingTasksMessages).toEqual({});
    });

    function setupVeeamServiceMocks () {
        spyOn(VeeamService, "getCapabilities")
            .and.returnValue({
                multiStorages: true,
                defaultQuota: 20,
                maxQuota: 42,
                maxStoragesCount: 20,
                minimumUsage: 15
            });
    }

    function acceptedResponse (result) {
        return {
            status: "OK",
            data: result
        };
    }
});
