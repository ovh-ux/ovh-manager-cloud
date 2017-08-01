'use strict';

describe('CloudProjectComputeFactory factory', function () {

    beforeEach(module('managerAppMock'));

    describe('CloudProjectComputeFactory loading', function () {

        it('should return a function type', inject(function (CloudProjectComputeFactory) {
            expect(typeof CloudProjectComputeFactory).toBe('function');
        }));

        it('should load CloudProjectComputeInfrastructureFactory', inject(function (CloudProjectComputeInfrastructureFactory) {
            expect(CloudProjectComputeInfrastructureFactory).not.toBe(null);
        }));

    });

    describe('CloudProjectComputeFactory instanciation', function () {

        it('should create an new instance of CloudProjectComputeFactory with expected attributes types', inject(function (CloudProjectComputeFactory, CloudProjectComputeInfrastructureFactory) {
            var cloudCompute = new CloudProjectComputeFactory();

            expect(cloudCompute.infrastructure instanceof CloudProjectComputeInfrastructureFactory).toBe(true);
        }));
    });

    describe('CloudProjectFactory method usage', function () {

        it('should return an Object when preparing to json', inject(function (CloudProjectComputeFactory) {
            var cloudCompute = new CloudProjectComputeFactory().prepareToJson();

            expect(typeof(cloudCompute)).toBe('object');
            expect(cloudCompute.prepareToJson).toBe(undefined);
        }));

    });

});
