angular.module("managerApp").factory('CloudProjectFactory',
    function (CloudProjectComputeFactory) {

        'use strict';

        /**
         *  Defines a cloud project
         *
         *  @param    {Object}  options                 - Options for creating a new CloudProject
         *  @param    {String}  options.serviceName     - Name (the unique id) of the CloudProject
         *  @param    {Object}  options.compute         - Options of the CloudProject compute part
         */
        var ProjectFactory = (function () {

            return function CloudProjectFactory (options) {

                if (!options) {
                    options = {};
                }

                if (!options.serviceName) {
                    throw new Error('serviceName option must be specified when creating a new CloudProjectFactory');
                }

                this.serviceName = options.serviceName || null;
                this.compute = new CloudProjectComputeFactory( angular.extend((options.compute || {}), { serviceName: this.serviceName }) );
                // + storage

            };

        })();

        ///////////////////////////////
        ///         METHODS          //
        ///////////////////////////////

        /**
         *  Prepare object to json encode function to avoid function being encoded.
         */
        ProjectFactory.prototype.prepareToJson = function () {
            return {
                serviceName: this.serviceName,
                compute: this.compute.prepareToJson()
            };
        };

        return ProjectFactory;

    }
);
