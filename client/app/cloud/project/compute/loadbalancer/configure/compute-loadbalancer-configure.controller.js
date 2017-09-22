class CloudProjectComputeLoadbalancerConfigureCtrl {
    constructor ($anchorScroll, $scope, $stateParams, $q, $location, $window, $translate, CloudProjectComputeLoadbalancerService,
                 OvhApiIpLoadBalancing, OvhApiCloudProjectIplb, OvhApiCloudProject, ovhDocUrl, CloudMessage, IpLoadBalancerTaskService,
                 ControllerHelper, CloudPoll) {
        this.$anchorScroll = $anchorScroll;
        this.$scope = $scope;
        this.$q = $q;
        this.$location = $location;
        this.$window = $window;
        this.$translate = $translate;
        this.CloudProjectComputeLoadbalancerService = CloudProjectComputeLoadbalancerService;
        this.OvhApiIpLoadBalancing = OvhApiIpLoadBalancing;
        this.OvhApiCloudProjectIplb = OvhApiCloudProjectIplb;
        this.OvhApiCloudProject = OvhApiCloudProject;
        this.ovhDocUrl = ovhDocUrl;
        this.CloudMessage = CloudMessage;
        this.IpLoadBalancerTaskService = IpLoadBalancerTaskService;
        this.ControllerHelper = ControllerHelper;
        this.CloudPoll = CloudPoll;

        this.serviceName = $stateParams.projectId;
        this.loadbalancerId = $stateParams.loadbalancerId;
        this.validate = $stateParams.validate;

        this.loaders = {
            loadbalancer: true,
            table: {
                server: false
            },
            form: {
                loadbalancer: false
            }
        };

        // Data
        this.loadbalancer = {};
        this.table = {
            server: []
        };

        this.form = {
            openstack: false,
            servers: {}
        };

        this.toggle = {
            updatedMessage: false
        };

    }

    $onInit () {

        // Get loadbalancer pending tasks and define poller
        this.tasks = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.IpLoadBalancerTaskService.getTasks(this.loadbalancerId).then(tasks => _.filter(tasks, task => _.includes(["todo", "doing"], task.status))),
            successHandler: () => this.startTaskPolling()
        });
        this.tasks.load();


        let validatePromise;
        // Terminate validation if params exists
        if (this.validate) {
            this.loaders.loadbalancer = true;
            validatePromise = this.OvhApiCloudProjectIplb.Lexi().validate({ serviceName: this.serviceName, id: this.validate }, {}).$promise
                .then(() => {
                    this.$location.search("validate", null);
                    this.toggle.updatedMessage = true;
                })
                .catch(err => this.CloudMessage.error([this.$translate.instant("cpc_loadbalancer_error"), err.data && err.data.message || ""].join(" ")))
                .finally(() => { this.loaders.loadbalancer = false; });
            this.validate = "";
        } else {
            validatePromise = Promise.resolve("");
        }
        // After validation, load the loadbalancer
        validatePromise.then(() => this.getLoadbalancer(true));

        this.$scope.$on("$destroy", () => this.stopTaskPolling());
        this.initGuides();
    }

    initGuides () {
        this.guides = {
            horizon: this.ovhDocUrl.getDocUrl("g1773.creer_un_acces_a_horizon")
        };
    }

    // Get cloud servers to add in the loadbalancer
    getServers () {
        if (this.loaders.table.server) {
            return this.$q.reject("servers already loading");
        }
        this.loaders.table.server = true;
        return this.$q.all({
            cloudServers: this.OvhApiCloudProject.Instance().Lexi().query({ serviceName: this.serviceName }).$promise,
            attachedServers: this.CloudProjectComputeLoadbalancerService.getAttachedServers(this.loadbalancer)
        }).then(({ cloudServers, attachedServers }) => {
            this.attachedServers = {};
            _.forEach(attachedServers, attachedServer => {
                if (attachedServer.status === "active") {
                    this.attachedServers[attachedServer.address] = attachedServer;
                }
            });
            this.form.servers = _.mapValues(this.attachedServers, e => !!e);
            // Generate array of object type as {ipv4, name}
            this.table.server = this.table.server.concat(
                _.uniq(
                    _.union(
                        _.flatten(_.map(cloudServers, server =>
                            _.map(_.filter(server.ipAddresses, { type: "public", version: 4 }), adresse => ({ label: server.name, ip: adresse.ip }))
                        )),
                        _.map(this.attachedServers, server => ({ label: server.displayName, ip: server.address }))
                    ),
                    "ip"
                )
            );
        }).catch(err => {
            this.table.server = null;
            this.CloudMessage.error([this.$translate.instant("cpc_server_error"), err.data && err.data.message || ""].join(" "));
        }).finally(() => { this.loaders.table.server = false; });
    }

    configureAndDeployLoadbalancer () {
        if (this.loaders.form.loadbalancer) {
            return this.$q.reject("already sending configuration");
        }
        this.loaders.form.loadbalancer = true;
        let configurePromise = this.$q.resolve();

        // Configure the HTTP(80) loadbalancer
        const configLoadBalancer = _.values(this.form.servers).length && _.reduce(this.form.servers, (res, value) => res && value, true) || _.values(this.attachedServers).length > 0;
        if (this.loadbalancer.status !== "custom" && this.loadbalancer.status !== "unavailable" && configLoadBalancer) {
            if (this.loadbalancer.status === "available") {
                // Create farm and front
                configurePromise = configurePromise.then(() => this.OvhApiIpLoadBalancing.Farm().Http().Lexi().post({ serviceName: this.loadbalancerId }, {
                    displayName: "PublicCloud",
                    port: 80,
                    zone: "all"
                }).$promise)
                    .then(farm => { this.loadbalancer.farm = farm; })
                    .then(() => this.OvhApiIpLoadBalancing.Frontend().Http().Lexi().post({ serviceName: this.loadbalancerId }, {
                        displayName: "PublicCloud",
                        port: 80,
                        zone: "all",
                        defaultFarmId: this.loadbalancer.farm.farmId
                    }).$promise)
                    .then(frontend => { this.loadbalancer.frontend = frontend; });
            }

            // Add or remove servers
            let modified = false;
            _.forEach(this.form.servers, (enable, ip) => {
                const server = _.find(this.table.server, { ip });
                const displayName = server ? server.label : null;
                if (enable && !this.attachedServers[ip]) {
                    modified = true;
                    configurePromise = configurePromise.then(() => this.OvhApiIpLoadBalancing.Farm().Http().Server().Lexi()
                        .post({ serviceName: this.loadbalancerId, farmId: this.loadbalancer.farm.farmId }, {
                            displayName,
                            port: 80,
                            address: ip,
                            status: "active"
                        }).$promise);
                }
                if (!enable && this.attachedServers[ip]) {
                    modified = true;
                    configurePromise = configurePromise.then(() => this.OvhApiIpLoadBalancing.Farm().Http().Server().Lexi()
                        .delete({
                            serviceName: this.loadbalancerId,
                            serverId: this.attachedServers[ip].serverId,
                            farmId: this.loadbalancer.farm.farmId
                        }).$promise);
                }
            });

            // Deploy configuration
            if (modified) {
                configurePromise = configurePromise.then(() => this.OvhApiIpLoadBalancing.Lexi().refresh({ serviceName: this.loadbalancerId }, {}).$promise)
                    .then(() => this.tasks.load())
                    .then(() => this.getLoadbalancer(true));
            }
        }
        // Configure the openstack importation
        if (this.form.openstack && (!this.loadBalancerImported || this.loadBalancerImported.status !== "validated")) {
            // Need to remove old import to recreate it
            if (this.loadBalancerImported) {
                configurePromise = configurePromise.then(() => this.OvhApiCloudProjectIplb.Lexi().delete({ serviceName: this.serviceName, id: this.loadBalancerImported.id }).$promise);
            }
            configurePromise = configurePromise.then(() =>
                // Import and redirect to auth page
                this.OvhApiCloudProjectIplb.Lexi().post({ serviceName: this.serviceName }, { ipLoadbalancingServiceName: this.loadbalancerId, redirection: `${this.$location.absUrl().replace(/\?.*$/, "")}?validate=%id` }).$promise
                    .then(result => {
                        this.$window.location.href = result.validationUrl;
                        this.loaders.form.redirect = true;
                    })
            );
        } else if (!this.form.openstack && this.loadBalancerImported) {
            configurePromise = configurePromise.then(() => this.OvhApiCloudProjectIplb.Lexi().delete({ serviceName: this.serviceName, id: this.loadBalancerImported.id }).$promise).then(() => {
                this.loadBalancerImported = null;
                this.form.openstack = false;
            });
        }
        return configurePromise.then(() => {
            this.toggle.updatedMessage = true;
            this.$location.hash("compute-loadbalancer-configure");
            this.$anchorScroll();
        }).catch(err => this.CloudMessage.error([this.$translate.instant("cpc_loadbalancer_error"), err.data && err.data.message || ""].join(" "))
        ).finally(() => { this.loaders.form.loadbalancer = false; });
    }

    getLoadbalancer (clearCache) {
        this.loaders.loadbalancer = true;
        if (clearCache) {
            this.OvhApiCloudProjectIplb.Lexi().resetQueryCache();
            this.OvhApiIpLoadBalancing.Lexi().resetQueryCache();
        }
        return this.$q.all({
            loadbalancer: this.CloudProjectComputeLoadbalancerService.getLoadbalancer(this.loadbalancerId),
            loadbalancersImported: this.CloudProjectComputeLoadbalancerService.getLoadbalancersImported(this.serviceName)
        }).then(({ loadbalancer, loadbalancersImported }) => {
            this.loadbalancer = loadbalancer;

            this.loadBalancerImported = loadbalancersImported[this.loadbalancer.serviceName];
            if (!this.loadBalancerImported) {
                return;
            }
            if (this.loadBalancerImported.status === "validated") {
                this.form.openstack = true;
            }
        }).then(() => { this.loaders.loadbalancer = false; })
            .then(() => this.getServers())
            .catch(err => {
                this.loadbalancer = null;
                this.CloudMessage.error([this.$translate.instant("cpc_loadbalancer_error"), err.data && err.data.message || ""].join(" "));
            });
    }

    toggleServer (ip) {
        this.form.servers[ip] = !this.form.servers[ip];
    }


    // Tasks poller
    startTaskPolling () {
        this.stopTaskPolling();

        this.poller = this.CloudPoll.pollArray({
            items: this.tasks.data,
            pollFunction: task => this.IpLoadBalancerTaskService.getTask(this.loadbalancerId, task.id),
            stopCondition: task => {
                const res = _.includes(["done", "error"], task.status);
                // Remove terminated tasks
                if (res) {
                    this.tasks.data = _.filter(this.tasks.data, t => t.id !== task.id);
                }
                return res;
            }
        });
    }

    stopTaskPolling () {
        if (this.poller) {
            this.poller.kill();
        }
    }
}
angular.module("managerApp").controller("CloudProjectComputeLoadbalancerConfigureCtrl", CloudProjectComputeLoadbalancerConfigureCtrl);
