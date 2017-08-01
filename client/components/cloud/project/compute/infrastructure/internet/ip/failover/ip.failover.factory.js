angular.module("managerApp").factory('CloudProjectComputeInfraIpFailoverFactory',
    function (Ip, CloudProjectIpFailover) {

        'use strict';

        /**
         *  Defines a cloud project compute infrastructure Failover IP
         *
         *  /!\ Take care when modifying this!!! Check setInfos, and prepareToJson too.
         */
        var IpFailoverFactory = (function () {

            return function CloudProjectComputeInfraIpFailoverFactory (options) {

                if (!options) {
                    options = {};
                }

                // Set custom values
                options = this.getCustomOptions(options);

                // Extend and set default values
                angular.extend(this, angular.extend({
                    id     : Math.floor(Math.random() * 1000 * new Date().getTime()),
                    status : 'ok'
                }, options));

            };

        })();

        ///////////////////////
        //      METHODS      //
        ///////////////////////

        /**
         *  Set customs options (for init, and updates)
         *  -> @devs: put your customs values here
         */
        IpFailoverFactory.prototype.getCustomOptions = function (options) {
            return angular.extend(options, {
                type     : 'failover',
                routedTo : options.routedTo ? _.flatten([options.routedTo]) : []    // Ensure routedTo is always an array
            });
        };

        /**
         *  Set infos after initialization
         */
        IpFailoverFactory.prototype.setInfos = function (options) {
            // Set custom values
            options = this.getCustomOptions(options || {});

            // Ok now extend it
            angular.extend(this, options);

            return this;
        };

        /**
         * Attach an IP to a vm
         */
        IpFailoverFactory.prototype.attach = function (vmId) {
            var self = this;
            return CloudProjectIpFailover.Lexi().attach({
                serviceName : this.serviceName,
                id          : this.id
            }, {
                instanceId  : vmId
            }).$promise.then(function (ipOptions) {
                self.status = ipOptions.status;
            });
        };

        /**
         * Detach an IP from a vm
         */
        IpFailoverFactory.prototype.detach = function () {
            var self = this;
            return CloudProjectIpFailover.Lexi().detach({
                serviceName : this.serviceName,
                id          : this.id
            }, {}).$promise.then(function (ipOptions) {
                self.status = ipOptions.status;
            });
        };

        /**
         * Park the IP
         */
        IpFailoverFactory.prototype.park = function () {
            var self = this;
            return Ip.Lexi().park({
                ip : this.ip
            }, {}).$promise.then(function (ipOptions) {
                self.status = ipOptions.status;
            });
        };

        /**
         *  Prepare object to json encode function to avoid function being encoded.
         */
        IpFailoverFactory.prototype.prepareToJson = function () {
            return {
                id: this.id,
                type: this.type
            };
        };


        return IpFailoverFactory;
    }
);
