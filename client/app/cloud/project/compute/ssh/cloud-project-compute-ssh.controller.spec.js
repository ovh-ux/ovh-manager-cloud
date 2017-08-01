"use strict";

describe("Controller: CloudProjectComputeSshCtrl", function () {

    var dataTest = readJSON('client/bower_components/ovh-api-services/src/cloud/project/sshKey/cloud-project-sshKey.service.dt.spec.json');

    // load the controller"s module
    beforeEach(module("managerAppMock"));

    var ssoAuthentication,
        $httpBackend,
        $rootScope,
        $controller,
        Toast,
        CloudProjectSshKey,
        $scope;

    beforeEach(inject(function (_ssoAuthentication_, _$httpBackend_, _$rootScope_, _$controller_, _CloudProjectSshKey_, _Toast_) {
        ssoAuthentication = _ssoAuthentication_;
        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
        $controller = _$controller_;
        CloudProjectSshKey = _CloudProjectSshKey_;
        Toast = _Toast_;

        spyOn(Toast, "error");
        spyOn(Toast, "success");

        $scope = $rootScope.$new();
    }));

    afterEach(inject(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
        $scope.$destroy();
    }));

    //-----

    var CloudProjectComputeSshCtrl;

    function initNewCtrl () {
        CloudProjectComputeSshCtrl = $controller("CloudProjectComputeSshCtrl", {
            $scope: $scope,
            $stateParams : {
                projectId : 'ac2b990f1d6e42899e764a8084bdf766'
            }
        });
    }

    //ssh key add model
    function expectSshAddInitState(){
        expect(CloudProjectComputeSshCtrl.sshAdd.serviceName).not.toBeNull();
        expect(CloudProjectComputeSshCtrl.sshAdd.name).toBeNull();
        expect(CloudProjectComputeSshCtrl.sshAdd.publicKey).toBeNull();
    }

    //-----

    describe("- Initialization controller in success case -", function () {

        beforeEach(function (){
            $httpBackend.whenGET(/\/cloud\/project\/[a-z0-9]+\/sshkey/).respond(200, dataTest.sshkeys);
            initNewCtrl();

            $httpBackend.flush();
        });


        xit("should set default value", function () {

            //ssh keys table
            expect(_.isEqual(CloudProjectComputeSshCtrl.table.ssh[0].toJSON(), dataTest.sshkeys[0])).toBeTruthy();
            expect(_.isEqual(CloudProjectComputeSshCtrl.table.ssh[1].toJSON(), dataTest.sshkeys[1])).toBeTruthy();

            expect(CloudProjectComputeSshCtrl.loaders.table.ssh).toBeFalsy();

            expectSshAddInitState();
        });

        //-----

        describe("- Display function -", function () {

            xit("should open and close add ssh key form", function () {
                expectSshAddInitState();
                expect(CloudProjectComputeSshCtrl.toggle.openAddSsh).toBeFalsy();

                //Open
                CloudProjectComputeSshCtrl.toggleAddSshKey();

                expectSshAddInitState();
                expect(CloudProjectComputeSshCtrl.toggle.openAddSsh).toBeTruthy();

                //Close
                CloudProjectComputeSshCtrl.sshAdd.name = "name";
                CloudProjectComputeSshCtrl.toggleAddSshKey();

                expectSshAddInitState();
                expect(CloudProjectComputeSshCtrl.toggle.openAddSsh).toBeFalsy();
            });
        });

        //-----

        describe("- Add ssh key -", function () {


            describe("success case", function () {

                beforeEach(function (){
                    $httpBackend.whenPOST(/\/cloud\/project\/[a-z0-9]+\/sshkey/).respond(200, dataTest.sshkey);
                });

                xit("should reinitialize model", function () {
                    CloudProjectComputeSshCtrl.sshAdd.name = "name";

                    spyOn(CloudProjectComputeSshCtrl, "getSshKeys");

                    CloudProjectComputeSshCtrl.postSshKey();
                    $httpBackend.flush();

                    expect(CloudProjectComputeSshCtrl.loaders.add.ssh).toBeFalsy();
                    expect(CloudProjectComputeSshCtrl.sshAdd.name).toEqual("name");
                    expect(CloudProjectComputeSshCtrl.getSshKeys.calls.count()).toEqual(1);
                    expect(Toast.success.calls.count()).toEqual(1);
                });
            });


            describe("error case", function () {

                beforeEach(function (){
                    $httpBackend.whenPOST(/\/cloud\/project\/[a-z0-9]+\/sshkey/).respond(500, dataTest.error);
                });

                xit("should not sent POST request (name already exist)", function () {
                    CloudProjectComputeSshCtrl.sshAdd.name = dataTest.sshkeys[0].name;

                    spyOn(CloudProjectSshKey, "Lexi");
                    spyOn(CloudProjectComputeSshCtrl, "getSshKeys");

                    CloudProjectComputeSshCtrl.postSshKey();

                    expect(CloudProjectComputeSshCtrl.loaders.add.ssh).toBeFalsy();
                    expect(CloudProjectComputeSshCtrl.sshAdd.name).toEqual(dataTest.sshkeys[0].name);
                    expect(CloudProjectSshKey.Lexi.calls.any()).toEqual(false);
                    expect(CloudProjectComputeSshCtrl.getSshKeys.calls.any()).toEqual(false);
                    expect(Toast.error.calls.count()).toEqual(1);
                });

                xit("should throw an error when post ssh key", function () {
                    CloudProjectComputeSshCtrl.sshAdd.name = "name";

                    spyOn(CloudProjectComputeSshCtrl, "getSshKeys");

                    CloudProjectComputeSshCtrl.postSshKey();
                    $httpBackend.flush();

                    expect(CloudProjectComputeSshCtrl.loaders.add.ssh).toBeFalsy();
                    expect(CloudProjectComputeSshCtrl.sshAdd.name).toEqual("name");
                    expect(CloudProjectComputeSshCtrl.getSshKeys.calls.any()).toEqual(false);
                    expect(Toast.error.calls.count()).toEqual(1);
                });
            });
        });

        //-----

        describe("- Delete ssh key -", function () {


            describe("success case", function () {

                beforeEach(function (){
                    $httpBackend.whenDELETE(/\/cloud\/project\/[a-z0-9]+\/sshkey\/[a-z0-9]+$/).respond(200, null);
                });

                xit("should delete reload ssh keys", function () {
                    spyOn(CloudProjectComputeSshCtrl, "getSshKeys");

                    CloudProjectComputeSshCtrl.deleteSshKey(dataTest.sshkey);
                    $httpBackend.flush();

                    expect(CloudProjectComputeSshCtrl.loaders.remove.ssh).toBeFalsy();
                    expect(CloudProjectComputeSshCtrl.getSshKeys.calls.count()).toEqual(1);
                    expect(Toast.success.calls.count()).toEqual(1);
                });
            });


            describe("error case", function () {

                beforeEach(function (){
                    $httpBackend.whenDELETE(/\/cloud\/project\/[a-z0-9]+\/sshkey\/[a-z0-9]+$/).respond(500, dataTest.error);
                });

                xit("should throw an error when delete ssh key", function () {
                    spyOn(CloudProjectComputeSshCtrl, "getSshKeys");

                    CloudProjectComputeSshCtrl.deleteSshKey(dataTest.sshkey);
                    $httpBackend.flush();

                    expect(CloudProjectComputeSshCtrl.loaders.remove.ssh).toBeFalsy();
                    expect(CloudProjectComputeSshCtrl.getSshKeys.calls.any()).toEqual(false);
                    expect(Toast.error.calls.count()).toEqual(1);
                });
            });
        });
    });

    //-----

    describe("- Initialization controller in error case -", function () {

        beforeEach(function (){
            $httpBackend.whenGET(/\/cloud\/project\/[a-z0-9]+\/sshkey/).respond(500, dataTest.error);
            initNewCtrl();

            $httpBackend.flush();
        });


        xit("should throw an error when get ssh keys", function () {
            //ssh keys table
            expect(CloudProjectComputeSshCtrl.table.ssh).toBeNull();

            expect(CloudProjectComputeSshCtrl.loaders.table.ssh).toBeFalsy();

            expectSshAddInitState();

            expect(Toast.error.calls.count()).toEqual(1);
        });
    });

});
