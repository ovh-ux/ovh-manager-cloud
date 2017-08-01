'use strict';

describe('CloudProjectFactory factory', function () {

    beforeEach(module('managerAppMock'));

    describe('CloudProjectFactory loading', function () {

        it('should return a function type', inject(function (CloudProjectFactory) {
            expect(typeof CloudProjectFactory).toBe('function');
        }));

        it('should load CloudProjectComputeFactory', inject(function (CloudProjectComputeFactory) {
            expect(CloudProjectComputeFactory).not.toBe(null);
        }));

    });

    describe('CloudProjectFactory instanciation', function () {

        it('should throw an error when creating new instance of CloudProjectFactory object because missing serviceName option', inject(function (CloudProjectFactory) {
            var cloudProject;
            try {
                cloudProject = new CloudProjectFactory();
            } catch (err) {
                cloudProject = null;
            }
            expect(cloudProject).toBe(null);
        }));

        it('should create an new instance of CloudProjectFactory with expected attributes types', inject(function (CloudProjectFactory, CloudProjectComputeFactory) {
            var cloudProject = new CloudProjectFactory({
                serviceName : 'ac2b990f1d6e42899e764a8084bdf766'
            });

            expect(typeof(cloudProject.serviceName)).toBe('string');
            expect(cloudProject.compute instanceof CloudProjectComputeFactory).toBe(true);
        }));
    });

    describe('CloudProjectFactory method usage', function () {

        it('should return an Object when preparing to json', inject(function (CloudProjectFactory) {
            var cloudProject = new CloudProjectFactory({
                serviceName : 'ac2b990f1d6e42899e764a8084bdf766'
            }).prepareToJson();

            expect(typeof(cloudProject)).toBe('object');
            expect(cloudProject.prepareToJson).toBe(undefined);
        }));

    });

});
