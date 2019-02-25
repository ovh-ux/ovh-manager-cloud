angular.module('managerApp').factory('CloudProjectComputeInfraInternetFactory',
  (CloudProjectComputeInfraIpFactory, CucOrderedHashFactory) => {
    /**
     *  Defines a cloud project compute infrastructure internet
     *
     *  @param    {Object}  optionsParam
     *                      Options for creating a new CloudProjectComputeInfraInternet
     *  @param    {Array}   optionsParam.ipList
     *                      List of ips present in CloudProjectComputeInfraInternet instance
     */
    const InternetFactory = (function () {
      return function CloudProjectComputeInfraInternetFactory(optionsParam) {
        const self = this;
        let options = optionsParam;

        if (!options) {
          options = {};
        }

        this.serviceName = options.serviceName || null;
        // TODO : make it an array of CucOrderedHashFactory
        this.ipList = new CucOrderedHashFactory();

        // Init le internet
        if (options.ipList && options.ipList.length) {
          angular.forEach(options.ipList, (ip) => {
            self.addIpToList(ip);
          });
        }
      };
    }());

    // ///////////////////////
    // /     FUNCTIONS      //
    // ///////////////////////

    /**
     *  Check if ip is already an instance or an options object
     */
    function checkIp(ip) {
      return (ip instanceof CloudProjectComputeInfraIpFactory.public
        || ip instanceof CloudProjectComputeInfraIpFactory.failover)
        ? ip
        : new CloudProjectComputeInfraIpFactory[ip.type](ip);
    }

    // ///////////////////////
    //       METHODS       //
    // ///////////////////////

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
      _.set(ip, 'serviceName', this.serviceName); // Add projectId to IP
      ip = checkIp(ip); // eslint-disable-line
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
      const self = this;
      return {
        ipList: _.map(this.ipList.sortedKeys, ipId => self.ipList.get(ipId).prepareToJson()),
      };
    };

    return InternetFactory;
  });
