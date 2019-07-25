class VpsCapabilitiesService {
  /* @ngInject */
  constructor($http) {
    this.$http = $http;
  }

  getCapabilities() {
    return this.$http.get('/capabilities', {
      serviceType: 'aapi',
    })
      .then(({ data }) => data.vps);
  }
}

angular.module('managerApp').service('VpsCapabilitiesService', VpsCapabilitiesService);
