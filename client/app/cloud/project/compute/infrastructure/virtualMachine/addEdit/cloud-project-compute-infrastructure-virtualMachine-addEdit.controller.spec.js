"use strict";

describe("Controller: CloudProjectComputeInfrastructureVirtualMachineAddEditCtrl", function () {

    var dataTest = {
        flavor   : readJSON('client/bower_components/ovh-api-services/src/cloud/project/flavor/cloud-project-flavor.service.dt.spec.json'),
        image    : readJSON('client/bower_components/ovh-api-services/src/cloud/project/image/cloud-project-image.service.dt.spec.json'),
        snapshot : readJSON('client/bower_components/ovh-api-services/src/cloud/project/snapshot/cloud-project-snapshot.service.dt.spec.json'),
        sshKey   : readJSON('client/bower_components/ovh-api-services/src/cloud/project/sshKey/cloud-project-sshKey.service.dt.spec.json'),
        price    : readJSON('client/bower_components/ovh-api-services/src/cloud/price/cloud-price.service.dt.spec.json')
    };

    // load the controller's module
    beforeEach(angular.mock.module("managerAppMock"));

    var ssoAuthentication,
        $httpBackend,
        $rootScope,
        $controller,
        $scope,
        $timeout,
        CloudMessage,
        CloudProjectComputeInfrastructureOrchestrator,
        VirtualMachineFactory;

    beforeEach(angular.mock.inject(function (_ssoAuthentication_, _$httpBackend_, _$rootScope_, _$controller_, _$timeout_, _CloudMessage_, _CloudProjectComputeInfrastructureOrchestrator_) {
        ssoAuthentication = _ssoAuthentication_;
        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
        $controller = _$controller_;
        $timeout = _$timeout_;
        CloudMessage = _CloudMessage_;

        CloudProjectComputeInfrastructureOrchestrator = _CloudProjectComputeInfrastructureOrchestrator_;

        spyOn(CloudMessage, "error");
        spyOn(CloudMessage, "success");

        $scope = $rootScope.$new();
    }));

    afterEach(angular.mock.inject(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
        $scope.$destroy();
    }));

    //-----

    var VmAddEditCtrl;

    function initNewCtrl () {
        VmAddEditCtrl = $controller("CloudProjectComputeInfrastructureVirtualMachineAddEditCtrl as VmAddEditCtrl", {
            $scope: $scope,
            $stateParams : {
                projectId : 'fc8381bd7271430191184ddc2bfd5671'
            }
        });
    }

    describe("- Initialization controller in success case -", function () {

        var vm;

        beforeEach(function () {
            initNewCtrl();

            vm = new VirtualMachineFactory({
                id: '2554d3cd-3dca-4dd7-8790-33252cbb2e30',
                serviceName : 'fc8381bd7271430191184ddc2bfd5671',
                status: 'DRAFT',
                name: 'Server 1',
                region: 'SBG1',
                flavorId : '1f1efedf-ec91-4a42-acd7-f5cf64b02d3c',
                imageId : 'f28baed2-78e8-40f6-b89d-89a01cb05e57'
            });
            // vm.price = _.find(dataTest.price.prices.instances, { flavorId: '1f1efedf-ec91-4a42-acd7-f5cf64b02d3c' });

            spyOn(CloudProjectComputeInfrastructureOrchestrator, 'getEditedVm').and.callFake(function () {
                vm.getFullInformations();
                $httpBackend.flush();
                return vm;
            });

            $httpBackend.whenGET(/\/cloud\/project\/[a-z0-9]+\/flavor/).respond(200, dataTest.flavor.flavors);
            $httpBackend.whenGET(/\/cloud\/project\/[a-z0-9]+\/image/).respond(200, dataTest.image.images);
            $httpBackend.whenGET(/\/cloud\/project\/[a-z0-9]+\/snapshot/).respond(200, dataTest.snapshot.snapshots);
            $httpBackend.whenGET(/\/cloud\/project\/[a-z0-9]+\/region/).respond(200, ['SBG1']);
            // --- @todo: region
            $httpBackend.whenGET(/\/cloud\/project\/[a-z0-9]+\/sshkey/).respond(200, dataTest.sshKey.sshkeys);
            $httpBackend.whenGET(/\/cloud\/price/).respond(200, dataTest.price.prices);

            $rootScope.$broadcast('responsive.switch.created', {
                getDisplayMode : function () {
                    return 'switch';
                },
                getActivePage : function () {
                    return 1;
                }
            });



            $scope.$digest();
            $httpBackend.flush();
        });


        // ---


        describe('- add or edit VM -', function () {

            xit('should initialize all datas and models with success', function () {

                // datas are set
                expect(VmAddEditCtrl.panelsData.flavors.length).toBeGreaterThan(0);
                expect(VmAddEditCtrl.panelsData.images.length).toBeGreaterThan(0);
                // expect(VmAddEditCtrl.panelsData.snapshots.length).toBeGreaterThan(0);
                // --- @todo: region
                // TO CHECK
                // expect(VmAddEditCtrl.panelsData.sshKeys.length).toBeGreaterThan(0);

                // models are set
                expect(VmAddEditCtrl.model.name).toEqual(vm.name);
                // expect(VmAddEditCtrl.model.flavorId).toEqual(vm.flavor.id);
                expect(VmAddEditCtrl.model.imageId).toEqual(vm.image.id);
                expect(VmAddEditCtrl.model.region).toEqual(vm.region);
                // expect(VmAddEditCtrl.model.sshKeyId).toEqual(vm.name);
            });

            xit('should changel models', function () {

                var newModels = {
                    name : 'new name',
                    flavorId: 'ac74cb45-d895-47dd-b9cf-c17778033d83',
                    imageId: 'c06fe6f2-3567-4ec3-8562-4cecf4044c30'/*,
                    snapshotId: 'bb346025-0596-41e5-8c07-114593c9bc21',
                    sshKeyId: '62573970'*/
                };

                // Change the flavor:
                VmAddEditCtrl.model.flavorId = newModels.flavorId;
                $scope.$apply();
                expect(VmAddEditCtrl.vmInEdition.flavor.id).toEqual(newModels.flavorId);
                expect(VmAddEditCtrl.toggle.accordions.flavors['ovh.steadfast.ram']).toBeTruthy();

                // Change the image:
                VmAddEditCtrl.model.imageId = newModels.imageId;
                $scope.$apply();
                expect(VmAddEditCtrl.vmInEdition.image.id).toEqual(newModels.imageId);
                expect(VmAddEditCtrl.toggle.accordions.images.linux).toBeTruthy();

                // @todo : snapshot and sshKey
                // Change the image to a snapshot:
                /*VmAddEditCtrl.model.imageId = newModels.snapshotId;
                $scope.$apply();
                expect(VmAddEditCtrl.vmInEdition.image.id).toEqual(newModels.snapshotId);
                expect(VmAddEditCtrl.toggle.accordions.images.snapshots).toBeTruthy();*/

                // Change the sshKey:
                /*VmAddEditCtrl.model.sshKeyId = newModels.sshKeyId;
                $scope.$apply();
                expect(VmAddEditCtrl.vmInEdition.sshKey.id).toEqual(newModels.sshKeyId);*/
            });

            xit('should update the server name', function () {

                var name = 'name';

                VmAddEditCtrl.toggleEditVmName();
                VmAddEditCtrl.model.name = name;
                VmAddEditCtrl.toggleEditVmName();

                expect(VmAddEditCtrl.vmInEdition.name).toEqual(name);

                // and cancel the update
                VmAddEditCtrl.toggleEditVmName();
                VmAddEditCtrl.model.name = 'editedName';
                VmAddEditCtrl.toggleEditVmName(true);

                expect(VmAddEditCtrl.vmInEdition.name).toEqual(name);
            });
        });


        // ---


        describe('- SSH Keys add or delete -', function () {

            xit('should create a new ssh key', function () {

                $httpBackend.expectPOST(/\/cloud\/project\/[a-z0-9]+\/sshkey/).respond(200, dataTest.sshKey.sshkey);

                spyOn(VmAddEditCtrl, "getSshKeys");

                VmAddEditCtrl.sshKeyAdd.name = 'name';
                VmAddEditCtrl.sshKeyAdd.publicKey = 'key';

                VmAddEditCtrl.postSshKey();
                $httpBackend.flush();

                // refresh called
                expect(VmAddEditCtrl.getSshKeys.calls.count()).toEqual(1);

            });

            xit('should delete an ssh key', function () {

                $httpBackend.expectDELETE(/\/cloud\/project\/[a-z0-9]+\/sshkey\/[a-z0-9]+$/).respond(200, null);

                spyOn(VmAddEditCtrl, "getSshKeys");

                VmAddEditCtrl.deleteSshKey(1);
                $httpBackend.flush();

                // refresh called
                expect(VmAddEditCtrl.getSshKeys.calls.count()).toEqual(1);

            });

        });

    });

});
