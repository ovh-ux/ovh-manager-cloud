angular.module("managerApp").factory('CloudProjectComputeInfraInternetFactory',
    function (CloudProjectComputeInfraIpFactory, OrderedHashFactory) {

        'use strict';

        /**
         *  Defines a cloud project compute infrastructure internet
         *
         *  @param    {Object}  options         - Options for creating a new CloudProjectComputeInfraInternet
         *  @param    {Array}   options.ipList  - List of ips present in CloudProjectComputeInfraInternet instance
         */
        var InternetFactory = (function () {

            return function CloudProjectComputeInfraInternetFactory (options) {

                var _self = this;

                if (!options) {
                    options = {};
                }

                this.serviceName = options.serviceName || null;
                this.ipList = new OrderedHashFactory();                // TODO : make it an array of OrderedHashFactory

                // Init le internet
                if (options.ipList && options.ipList.length) {
                    angular.forEach(options.ipList, function (ip) {
                        _self.addIpToList(ip);
                    });
                }

            };

        })();

        /////////////////////////
        //       METHODS       //
        /////////////////////////

        /**
         *  Get an infra ip from its ID.
         */
        InternetFactory.prototype.getIpById = function (ipId) {
            return this.ipList.get(ipId);
        };

        /**
         *  Get next index in IPs list.
         */
        InternetFactory.prototype.getNextIpIndex = function () {
            return this.ipList.length();
        };

        // ---

        /**
         *  Add an ip into ip list.
         */
        InternetFactory.prototype.addIpToList = function (ip) {
            ip.serviceName = this.serviceName;    // Add projectId to IP
            ip = __checkIp(ip);
            this.ipList.push(ip);
            return ip;
        };

        /**
         *  Remove given IP from ipList
         */
        InternetFactory.prototype.removeIpFromList = function (ipToDelete) {
            this.ipList.removeItem(ipToDelete);
            return ipToDelete;
        };

        // ---

        /**
         *  Prepare object to json encode function to avoid function being encoded
         */
        InternetFactory.prototype.prepareToJson = function () {
            var _self = this;
            return {
                ipList: _.map(this.ipList.sortedKeys, function (ipId) {
                    return _self.ipList.get(ipId).prepareToJson();
                })
            };
        };


        /////////////////////////
        ///     FUNCTIONS      //
        /////////////////////////

        /**
         *  Check if ip is already an instance or an options object
         */
        function __checkIp (ip) {
            return (ip instanceof CloudProjectComputeInfraIpFactory['public'] ||
                    ip instanceof CloudProjectComputeInfraIpFactory.failover) ? ip : new CloudProjectComputeInfraIpFactory[ip.type](ip);
        }

        return InternetFactory;

    }
);
