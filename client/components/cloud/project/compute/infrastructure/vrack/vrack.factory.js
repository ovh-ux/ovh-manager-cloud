angular.module("managerApp").factory('CloudProjectComputeInfraVrackFactory',
    function (CloudProjectComputeInfraVrackVmFactory, OrderedHashFactory) {

        'use strict';

        /**
         *  Defines a cloud project compute infrastructure vrack
         *
         *  @param    {Object}  options                 - Options for creating a new CloudProjectInfraVrack
         *  @param    {Array}   options.publicCloud     - List of VirtualMachine options or VirtualMachine instances
         */
        var VrackFactory = (function () {

            return function CloudProjectComputeInfraVrackFactory (options) {

                var self = this;

                if (!options) {
                    options = {};
                }

                this.serviceName = options.serviceName || null;
                this.publicCloud = new OrderedHashFactory();

                // init public cloud
                if (options.publicCloud && options.publicCloud.length) {
                    angular.forEach(options.publicCloud, function (publicVm) {
                        self.addVmToPublicCloudList(publicVm);
                    });
                }
            };

        })();

        ///////////////////////
        //      METHODS      //
        ///////////////////////

        /**
         *  Get a vm from its id. Check first in public cloud and then in private cloud.
         */
        VrackFactory.prototype.getVmById = function (vmId) {
            return this.publicCloud.get(vmId);
        };

        /**
         *  Get next index of vm in current Vrack (used for giving the default vm name option)
         */
        VrackFactory.prototype.getNextIndex = function () {
            return this.publicCloud.length();
        };

        // ---

        /**
         *  Add a public vm into Vrack list
         */
        VrackFactory.prototype.addVmToPublicCloudList = function (vm) {
            vm.serviceName = this.serviceName;    // Add projectId to VM
            vm = __checkVm(vm);
            // Avoid conflict of adding an existing vm
            if (!this.publicCloud.get(vm)) {
                this.publicCloud.push(vm);
            }
            return vm;
        };


        /**
         *  Remove given Virtual Machine from vrack public cloud list
         */
        VrackFactory.prototype.removeVmFromPublicCloudList = function (vm) {
            this.publicCloud.removeItem(vm);
            return vm;
        };


        /**
         *  Collapse all Vms
         */
        VrackFactory.prototype.collapseAll = function () {
            var items = this.publicCloud.getItems();
            angular.forEach(items, function (vm) {
                vm.collapsed = true;
            });
        };

        /**
         *  Uncollapse all Vms
         */
        VrackFactory.prototype.uncollapseAll = function () {
            var items = this.publicCloud.getItems();
            angular.forEach(items, function (vm) {
                vm.collapsed = false;
            });
        };

        /**
         *  Prepare object to json encode function to avoid function being encoded.
         */
        VrackFactory.prototype.prepareToJson = function () {
            var self = this;
            return {
                publicCloud: _.map(this.publicCloud.sortedKeys, function (vmId) {
                    return self.publicCloud.get(vmId).prepareToJson();
                })
            };
        };

        ///////////////////////
        //      FUNCTIONS    //
        ///////////////////////

        /**
         *  Check if vm is already an instance or an options object
         */
        function __checkVm (vm) {
            return vm instanceof CloudProjectComputeInfraVrackVmFactory ? vm : new CloudProjectComputeInfraVrackVmFactory(vm);
        }

        return VrackFactory;

    }
);
