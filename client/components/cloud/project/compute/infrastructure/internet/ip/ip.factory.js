angular.module("managerApp").factory('CloudProjectComputeInfraIpFactory',
    function (CloudProjectComputeInfraIpPublicFactory, CloudProjectComputeInfraIpFailoverFactory) {

        'use strict';

        return {
            'public'   : CloudProjectComputeInfraIpPublicFactory,
            'failover' : CloudProjectComputeInfraIpFailoverFactory
        };

    }
);
