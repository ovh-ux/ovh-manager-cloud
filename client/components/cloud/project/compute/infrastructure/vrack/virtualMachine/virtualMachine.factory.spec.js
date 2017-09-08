'use strict';

describe('CloudProjectComputeInfraVrackVmFactory factory', function () {

    var CloudProjectComputeInfraVrackVmFactory;

    beforeEach(module('managerAppMock'));
    beforeEach(inject(['CloudProjectComputeInfraVrackVmFactory', function (vm) {
        CloudProjectComputeInfraVrackVmFactory = vm;
    }]));

    describe('CloudProjectComputeInfraVrackVmFactory loading', function () {

        xit('should return a function type', function () {
            expect(typeof CloudProjectComputeInfraVrackVmFactory).toBe('function');
        });

        xit('should load OvhApiCloudProjectInstance service', inject(function (OvhApiCloudProjectInstance) {
            expect(OvhApiCloudProjectInstance).not.toBe(null);
        }));

    });

    describe('CloudProjectComputeInfraVrackVmFactory instanciation', function () {

        xit('should create an new instance of CloudProjectComputeInfraVrackVmFactory with default attributes values setted', function () {
            var vm = new CloudProjectComputeInfraVrackVmFactory({});

            expect(vm.created).not.toBe(undefined);
            expect(vm.status).not.toBe(undefined);
            expect(vm.id).not.toBe(undefined);
            expect(vm.flavor).toBe(null);
            expect(vm.image).toBe(null);
            expect(vm.ipAddresses instanceof Array).toBe(true);
            expect(vm.name).toBe(null);
            expect(vm.region).toBe(null);
            expect(vm.sshKey).toBe(null);
        });
    });

    describe('CloudProjectComputeInfraVrackVmFactory method usage', function () {

        xit('should be call each methods without trouble', function () {
            var vm = new CloudProjectComputeInfraVrackVmFactory({
                serviceName : 'ac2b990f1d6e42899e764a8084bdf766',
                status : 'DRAFT'
            });

            expect(!!vm.inEdition).toBeFalsy();

            expect(vm.status === 'DRAFT').toBeTruthy();

            var preparedJson = vm.prepareToJson();
            expect(typeof(preparedJson)).toBe('object');
            expect(preparedJson.prepareToJson).toBe(undefined);

            vm.startEdition();
            expect(!!vm.inEdition).toBeTruthy();
        });

    });

});
