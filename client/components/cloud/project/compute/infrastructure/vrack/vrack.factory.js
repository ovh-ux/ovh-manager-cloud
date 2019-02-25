angular.module('managerApp').factory('CloudProjectComputeInfraVrackFactory',
  (CloudProjectComputeInfraVrackVmFactory, CucOrderedHashFactory) => {
    /**
     *  Defines a cloud project compute infrastructure vrack
     *
     *  @param    {Object}  options
     *                      Options for creating a new CloudProjectInfraVrack
     *  @param    {Array}   options.publicCloud
     *                      List of VirtualMachine options or VirtualMachine instances
     */
    const VrackFactory = (function () {
      return function CloudProjectComputeInfraVrackFactory(optionsParam) {
        const self = this;
        let options = optionsParam;

        if (!options) {
          options = {};
        }

        this.serviceName = options.serviceName || null;
        this.publicCloud = new CucOrderedHashFactory();

        // init public cloud
        if (options.publicCloud && options.publicCloud.length) {
          angular.forEach(options.publicCloud, (publicVm) => {
            self.addVmToPublicCloudList(publicVm);
          });
        }
      };
    }());

    // /////////////////////
    //      METHODS      //
    // /////////////////////

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
      _.set(vm, 'serviceName', this.serviceName); // Add projectId to VM
      vm = checkVm(vm); // eslint-disable-line
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
      const items = this.publicCloud.getItems();
      angular.forEach(items, (vm) => {
        _.set(vm, 'collapsed', true);
      });
    };

    /**
     *  Uncollapse all Vms
     */
    VrackFactory.prototype.uncollapseAll = function () {
      const items = this.publicCloud.getItems();
      angular.forEach(items, (vm) => {
        _.set(vm, 'collapsed', false);
      });
    };

    /**
     *  Prepare object to json encode function to avoid function being encoded.
     */
    VrackFactory.prototype.prepareToJson = function () {
      const self = this;
      return {
        publicCloud: _.map(
          this.publicCloud.sortedKeys,
          vmId => self.publicCloud.get(vmId).prepareToJson(),
        ),
      };
    };

    // /////////////////////
    //      FUNCTIONS    //
    // /////////////////////

    /**
     *  Check if vm is already an instance or an options object
     */
    function checkVm(vm) {
      return vm instanceof CloudProjectComputeInfraVrackVmFactory
        ? vm
        : new CloudProjectComputeInfraVrackVmFactory(vm);
    }

    return VrackFactory;
  });
