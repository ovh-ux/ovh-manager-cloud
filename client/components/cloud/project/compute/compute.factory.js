angular.module("managerApp").factory('CloudProjectComputeFactory',
    function (CloudProjectComputeInfrastructureFactory, CloudProjectComputeVolumesFactory) {

        'use strict';

        /**
         *  Defines a cloud project compute
         *
         *  @param    {Object}  options                 - Options for creating a new CloudProjectCompute
         *  @param    {Object}  options.infrastructure  - Options of the CloudProjectCompute infrastructure
         *  @param    {Object}  options.volumes         - Options of the CloudProjectCompute volumes
         */
        var ComputeFactory = (function () {

            return function CloudProjectComputeFactory (options) {

                if (!options) {
                    options = {};
                }

                this.serviceName = options.serviceName || null;

                this.infrastructure = new CloudProjectComputeInfrastructureFactory( angular.extend((options.infrastructure || {}), { serviceName: this.serviceName }) );
                this.volumes = new CloudProjectComputeVolumesFactory( angular.extend((options.volumes || {}), { serviceName: this.serviceName }) );
            };

        })();

        ///////////////////////////////
        ///         METHODS          //
        ///////////////////////////////

        /**
         *  Prepare object to json encode function to avoid function being encoded
         */
        ComputeFactory.prototype.prepareToJson = function () {
            return {
                infrastructure: this.infrastructure.prepareToJson()
            };
        };

        return ComputeFactory;

    }
);
