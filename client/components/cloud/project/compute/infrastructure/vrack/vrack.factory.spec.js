'use strict';

describe('CloudProjectComputeInfraVrackFactory factory', function () {

    beforeEach(module('managerAppMock'));

    describe('CloudProjectComputeInfraVrackFactory loading', function () {

        it('should return a function type', inject(function (CloudProjectComputeInfraVrackFactory) {
            expect(typeof CloudProjectComputeInfraVrackFactory).toBe('function');
        }));

        it('should load CloudProjectComputeInfraVrackFactory', inject(function (CloudProjectComputeInfraVrackVmFactory) {
            expect(CloudProjectComputeInfraVrackVmFactory).not.toBe(null);
        }));

    });

    describe('CloudProjectComputeInfraVrackFactory instanciation', function () {

        it('should create an new instance of CloudProjectComputeInfraVrackFactory with expected attributes types', inject(function (CloudProjectComputeInfraVrackFactory) {
            var vrack = new CloudProjectComputeInfraVrackFactory();

            expect(vrack.publicCloud.length()).toBe(0);
        }));
    });

    describe('CloudProjectComputeInfraVrackFactory method usage', function () {

        var vrack = null;

        beforeEach(inject(function (CloudProjectComputeInfraVrackFactory) {
            vrack = new CloudProjectComputeInfraVrackFactory();
        }));

        it('should be call each methods without trouble', inject(function (CloudProjectComputeInfraVrackVmFactory) {
            // addPublicVm
            vrack.addVmToPublicCloudList({ id : '123456789' });
            expect(vrack.publicCloud.length()).toBe(1);
            expect(vrack.publicCloud.get('123456789') instanceof CloudProjectComputeInfraVrackVmFactory).toBe(true);
            vrack.addVmToPublicCloudList({ id : '987654321' });
            expect(vrack.publicCloud.length()).toBe(2);
            expect(vrack.publicCloud.get('987654321') instanceof CloudProjectComputeInfraVrackVmFactory).toBe(true);
            // getNextIndex
            expect(vrack.getNextIndex()).toEqual(2);
            // prepareToJson
            var preparedJson = vrack.prepareToJson();
            expect(typeof(preparedJson)).toBe('object');
            expect(preparedJson.prepareToJson).toBe(undefined);
        }));

    });

});
