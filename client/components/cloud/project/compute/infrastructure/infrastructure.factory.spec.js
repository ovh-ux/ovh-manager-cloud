'use strict';

describe('CloudProjectComputeInfrastructureFactory factory', function () {

    beforeEach(module('managerAppMock'));

    describe('CloudProjectComputeInfrastructureFactory loading', function () {

        it('should return a function type', inject(function (CloudProjectComputeInfrastructureFactory) {
            expect(typeof CloudProjectComputeInfrastructureFactory).toBe('function');
        }));

        it('should load CloudProjectComputeInfrastructureFactory', inject(function (CloudProjectComputeInfraVrackFactory) {
            expect(CloudProjectComputeInfraVrackFactory).not.toBe(null);
        }));

    });

    describe('CloudProjectComputeInfrastructureFactory instanciation', function () {

        it('should create an new instance of CloudProjectComputeInfrastructureFactory with expected attributes types', inject(function (CloudProjectComputeInfrastructureFactory, CloudProjectComputeInfraVrackFactory) {
            var cloudCompute = new CloudProjectComputeInfrastructureFactory();

            expect(cloudCompute.vrack instanceof CloudProjectComputeInfraVrackFactory).toBe(true);
        }));
    });

    describe('CloudProjectComputeInfrastructureFactory method usage', function () {

        it('should return an Object when preparing to json', inject(function (CloudProjectComputeInfrastructureFactory) {
            var cloudInfra = new CloudProjectComputeInfrastructureFactory().prepareToJson();

            expect(typeof(cloudInfra)).toBe('object');
            expect(cloudInfra.prepareToJson).toBe(undefined);
        }));

    });

});
