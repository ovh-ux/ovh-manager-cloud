"use strict";
/**
 *  Cloud Project Orchestrator. Gonna touch the stars!
 *  ==================================================
 *
 *  =README=
 *  This orchestrator is used to globally manage a cloud project.
 *
 *  /!\ Make sure to ALWAYS:
 *      - use this service to init a section
 *      - use this service to trigger cross sections actions (e.g.: create a vm from snapshot)
 */
angular.module("managerApp").service("CloudProjectOrchestrator",
    function ($q, CloudProjectFactory, CloudProjectComputeInfrastructureOrchestrator, CloudProjectComputeVolumesOrchestrator,
              CloudProject, CloudProjectIpLexi, CLOUD_PROJECT_OVERVIEW_THRESHOLD) {

        var _self = this;

        this.project = {};    // by serviceName

        var createInstanceFromSnapshot = null;


        /**
         *  At next infrastructure init, ask to create a vm via a snapshot.
         */
        this.askToCreateInstanceFromSnapshot = function (snapshot) {
            createInstanceFromSnapshot = snapshot;
            return $q.when(true);
        };

        this.hasTooManyInstances = function(projectId) {
            return CloudProject.Instance().Lexi().query({
                serviceName: projectId
            }).$promise
                .then(function (instances) {
                    return instances.length > CLOUD_PROJECT_OVERVIEW_THRESHOLD.instances;
                });
        };

        this.hasTooManyIps = function(projectId) {
            return CloudProjectIpLexi.query({
                serviceName: projectId
            }).$promise
                .then(function (ips) {
                    return ips.length > CLOUD_PROJECT_OVERVIEW_THRESHOLD.ips;
                });
        };

        /*======================================
        =            INITIALISATION            =
        ======================================*/

        // Init Project factory, or return it if already created
        this.init = function (opts) {
            if (_self.project[opts.serviceName]) {
                return $q.when(_self.project[opts.serviceName]);
            } else {
                return $q.when(new CloudProjectFactory(opts)).then(function (project) {
                    _self.project[opts.serviceName] = project;
                    return project;
                });
            }
        };

        // Init infrastructure factory only
        this.initInfrastructure = function (opts) {
            return this.init(opts).then(function () {
                return _initInfrastructure(opts);
            });
        };

        // Init volumes factory only
        this.initVolumes = function (opts) {
            return this.init(opts).then(function () {
                return _initVolumes(opts);
            });
        };

        // -------------------------------------------------------------------------------------------

        /**
         *  Init infrastructure section
         */
        function _initInfrastructure (opts) {
            return CloudProjectComputeInfrastructureOrchestrator.init(opts).then(function (infra) {
                _self.project[opts.serviceName].compute.infrastructure = infra;
                return _self.project[opts.serviceName].compute.infrastructure;
            }).then(function (infra) {
                if (createInstanceFromSnapshot) {
                    return CloudProjectComputeInfrastructureOrchestrator.addNewVmToList({
                        name   : createInstanceFromSnapshot.name,
                        imageId: createInstanceFromSnapshot.id,
                        region : createInstanceFromSnapshot.region
                    }).then(function (vm) {
                        CloudProjectComputeInfrastructureOrchestrator.turnOnVmEdition(vm);
                        createInstanceFromSnapshot = null;
                        return infra;
                    });
                }
                return infra;
            });
        }

        /**
         *  Init volumes section
         */
        function _initVolumes (opts) {
            return CloudProjectComputeVolumesOrchestrator.init(opts).then(function (volumes) {
                _self.project[opts.serviceName].compute.volumes = volumes;
                return _self.project[opts.serviceName].compute.volumes;
            });
        }
    }
);
