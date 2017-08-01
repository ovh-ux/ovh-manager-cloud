"use strict";

xdescribe("Controller: CloudProjectComputeSnapshotAddCtrl", function () {

    var dataTest = readJSON('client/bower_components/ovh-api-services/src/cloud/project/instance/cloud-project-instance.service.dt.spec.json');

    // load the controller"s module
    beforeEach(module("managerAppMock"));

    var ssoAuthentication,
        $httpBackend,
        $rootScope,
        $controller,
        Toast,
        CloudProjectSnapshot,
        CloudProjectComputeInfraVrackVmFactory,
        $uibModalInstance,
        $scope;

    beforeEach(inject(function (_ssoAuthentication_, _$httpBackend_, _$rootScope_, _$controller_, _CloudProjectSnapshot_, _Toast_, _CloudProjectComputeInfraVrackVmFactory_) {
        ssoAuthentication = _ssoAuthentication_;
        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
        $controller = _$controller_;
        CloudProjectSnapshot = _CloudProjectSnapshot_;
        Toast = _Toast_;
        CloudProjectComputeInfraVrackVmFactory = _CloudProjectComputeInfraVrackVmFactory_;
        $uibModalInstance = {
            close : function(){
                return true;
            },
            dismiss : function(){
                return true;
            }
        };

        spyOn(Toast, "error");
        spyOn(Toast, "success");
        spyOn(CloudProjectSnapshot.Lexi(), "resetQueryCache");

        $scope = $rootScope.$new();
    }));

    afterEach(inject(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
        $scope.$destroy();
    }));

    //-----

    var CloudProjectComputeSnapshotAddCtrl;

    function initNewCtrl () {

        CloudProjectComputeSnapshotAddCtrl = $controller("CloudProjectComputeSnapshotAddCtrl as CloudProjectComputeSnapshotAddCtrl", {
            $scope: $scope,
            params : new CloudProjectComputeInfraVrackVmFactory(dataTest.instance),
            $uibModalInstance : $uibModalInstance
        });
    }

    //-----

    describe("- Initialization controller in success case -", function () {

        beforeEach(function (){
            initNewCtrl();
        });

        it("should set default value", function () {
            expect(CloudProjectComputeSnapshotAddCtrl.snapshot.vm.id).toEqual(dataTest.instance.id);
            expect(CloudProjectComputeSnapshotAddCtrl.snapshot.name).toContain(dataTest.instance.name + ' ');
            expect(CloudProjectComputeSnapshotAddCtrl.loaders.backup).toBeFalsy();
        });

        //-----

        describe("- Display function -", function () {

            it("should cancel and close modal", function () {
                spyOn($uibModalInstance, "dismiss");

                CloudProjectComputeSnapshotAddCtrl.cancel();

                expect($uibModalInstance.dismiss.calls.count()).toEqual(1);
            });

        });

        describe("success case", function () {

            beforeEach(function (){
                $httpBackend.whenPOST(/\/cloud\/project\/instance\/[a-z0-9\-]+\/snapshot/).respond(200, null);
            });

            it("should valid, launch backup and close modal", function () {
                spyOn($uibModalInstance, "close");

                CloudProjectComputeSnapshotAddCtrl.backup();
                $httpBackend.flush();

                expect(Toast.success.calls.count()).toEqual(1);
                expect($uibModalInstance.close.calls.count()).toEqual(1);
                expect(CloudProjectComputeSnapshotAddCtrl.loaders.backup).toBeFalsy();
                expect(CloudProjectSnapshot.Lexi().resetQueryCache.calls.count()).toEqual(1);
            });

        });

        describe("error case", function () {

            beforeEach(function (){
                $httpBackend.whenPOST(/\/cloud\/project\/instance\/[a-z0-9\-]+\/snapshot/).respond(500, dataTest.error);
            });

            it("should valid, launch error notify and not close modal", function () {
                spyOn($uibModalInstance, "close");

                CloudProjectComputeSnapshotAddCtrl.backup();
                $httpBackend.flush();

                expect(Toast.error.calls.count()).toEqual(1);
                expect($uibModalInstance.close.calls.count()).toEqual(0);
                expect(CloudProjectComputeSnapshotAddCtrl.loaders.backup).toBeFalsy();
                expect(CloudProjectSnapshot.Lexi().resetQueryCache.calls.count()).toEqual(1);
            });

        });

    });
});
