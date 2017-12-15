"use strict";

describe("Controller: CloudProjectComputeInfrastructureDiagramCtrl", function () {

    var dataTest = {
        instance : readJSON('client/bower_components/ovh-api-services/src/cloud/project/instance/cloud-project-instance.service.dt.spec.json'),
        ip       : readJSON('client/bower_components/ovh-api-services/src/ip/ip.service.dt.spec.json'),
        flavor   : readJSON('client/bower_components/ovh-api-services/src/cloud/project/flavor/cloud-project-flavor.service.dt.spec.json'),
        image    : readJSON('client/bower_components/ovh-api-services/src/cloud/project/image/cloud-project-image.service.dt.spec.json'),
        snapshot : readJSON('client/bower_components/ovh-api-services/src/cloud/project/snapshot/cloud-project-snapshot.service.dt.spec.json'),
        sshKey   : readJSON('client/bower_components/ovh-api-services/src/cloud/project/sshKey/cloud-project-sshKey.service.dt.spec.json'),
        price    : readJSON('client/bower_components/ovh-api-services/src/cloud/price/cloud-price.service.dt.spec.json')
    };

    // load the controller's module
    beforeEach(angular.mock.module("managerAppMock"));

    var ssoAuthentication;
    var $httpBackend;
    var $rootScope;
    var $controller;
    var $scope;
    var $q;
    var $timeout;
    var CloudMessage;
    var $uibModal;
    var CloudProjectComputeInfrastructureOrchestrator;
    var $state;


    beforeEach(inject(function (_ssoAuthentication_, _$httpBackend_, _$rootScope_, _$controller_, _$timeout_,
                                _CloudMessage_, _CloudProjectComputeInfrastructureOrchestrator_, _$uibModal_, _$state_,
                                _$q_) {
        ssoAuthentication = _ssoAuthentication_;
        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
        $controller = _$controller_;
        $timeout = _$timeout_;
        $q = _$q_;
        CloudMessage = _CloudMessage_;
        $state = _$state_;
        $uibModal = _$uibModal_;

        CloudProjectComputeInfrastructureOrchestrator = _CloudProjectComputeInfrastructureOrchestrator_;

        spyOn(CloudMessage, "error");
        spyOn(CloudMessage, "success");

        $scope = _$rootScope_.$new();
    }));

    afterEach(angular.mock.inject(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
        $scope.$destroy();
    }));

    //-----

    var CloudProjectComputeInfrastructureDiagramCtrl;

    function initNewCtrl () {
        CloudProjectComputeInfrastructureDiagramCtrl = $controller("CloudProjectComputeInfrastructureDiagramCtrl", {
            $scope: $scope,
            $state: $state,
            $stateParams : {
                projectId : 'fc8381bd7271430191184ddc2bfd5671'
            }
        });
    }

    describe("- Initialization controller in success case -", function () {

        beforeEach(function () {
            $httpBackend.whenGET(/\/cloud\/project\/[a-z0-9]+\/instance/).respond(200, dataTest.instance.instances);
            $httpBackend.whenGET(/\/apiv6\/ip\/[a-zA-Z\.\%0-9]+$/).respond(200, dataTest.ip.ip);
            $httpBackend.whenGET(/\/apiv6\/ip/).respond(200, dataTest.ip.ips);

            $httpBackend.whenGET(/\/cloud\/project\/[a-z0-9]+\/flavor/).respond(200, dataTest.flavor.flavors);
            $httpBackend.whenGET(/\/cloud\/project\/[a-z0-9]+\/image/).respond(200, dataTest.image.images);
            $httpBackend.whenGET(/\/cloud\/project\/[a-z0-9]+\/snapshot/).respond(200, dataTest.snapshot.snapshots);
            // --- @todo: region
            $httpBackend.whenGET(/\/cloud\/project\/[a-z0-9]+\/sshkey/).respond(200, dataTest.sshKey.sshkeys);
            $httpBackend.whenGET("/order/catalog/formatted/cloud").respond(200, []);

            // IPFO
            $httpBackend.whenGET(/\/ip\/[a-zA-Z\.\%0-9]+\/task/).respond(200, []);

            $scope.$digest();
            $httpBackend.flush();
        });

        it("should redirect to project overview if '$scope.redirectToOverview' resolve to true", function() {
            spyOn($state, "go").and.returnValue($q.when(true));
            $scope.redirectToOverview = true;

            initNewCtrl();

            expect($state.go).toHaveBeenCalledWith("iaas.pci-project.compute.infrastructure-overview");
        });

        xit('should initialize all datas and models with success', function () {

            // datas are set
            expect(CloudProjectComputeInfrastructureDiagramCtrl.infra.vrack.publicCloud.length()).toBeGreaterThan(0);
            // expect(CloudProjectComputeInfrastructureDiagramCtrl.infra.internet.ips.length).toBeGreaterThan(0);

        });

        xit('should open modal to create snapshot', function () {
            spyOn($uibModal, "open");
        });

    });

});
