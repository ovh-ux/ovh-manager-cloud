angular.module("managerApp").directive("privateNetworkList", function () {
    "use strict";

    var Controller = function ($rootScope, $translate, $stateParams, $state, $q, $uibModal, Toast, CloudProjectNetworkPrivate, CloudProject, REDIRECT_URLS, Vrack, CloudProjectComputeInfrastructurePrivateNetworkService) {
        this.resources = {
            privateNetwork: CloudProjectNetworkPrivate.Lexi(),
            project: CloudProject.Lexi(),
            aapi: Vrack.Aapi(),
            modal: $uibModal
        };

        this.toast = Toast;

        this.translate = $translate;

        this.serviceName = null;

        this.service = CloudProjectComputeInfrastructurePrivateNetworkService;

        this.$rootScope = $rootScope;
        this.$q = $q;

        this.loaders = {
            privateNetworks: {
                query: false
            },
            vrack: {
                get: false
            }
        };

        this.urls = {
            vrack: REDIRECT_URLS.vRack
        };

        this.models = {
            vrack: null
        };

        this.collections = {
            privateNetworks: []
        };

        this.states = {
            dialog: {
                visible: false
            }
        };

        if (angular.isUndefined($stateParams.projectId)) {
            this.toast.error($translate.instant("cpci_private_network_list_context_error"));
        } else {
            this.serviceName = $stateParams.projectId;
        }

        $rootScope.$on("private-network-dialog:hide", this.hideDialog.bind(this));
        $rootScope.$on("private-networks:create", this.createPrivateNetworks.bind(this));

        this.$state = $state;

        // Loading privateNetwork first because vrack can fallback to privateNetworkList to find it's ID.
        this.fetchPrivateNetworks()
            .then(this.fetchVrack.bind(this));
    };

    Controller.prototype.fetchVrack = function () {
        if (this.loaders.vrack.get) {
            return;
        }

        this.loaders.vrack.get = true;

        return this.resources.project.vrack({ serviceName: this.serviceName }).$promise
            .then(function (vrack) {
                // vrack response is name/description
                this.models.vrack = vrack;
                return;
            }.bind(this))
            .then(this.getVrackId.bind(this))
            .then(function (id) {
                this.models.vrack.id = id;
            }.bind(this))
            .catch(function () {
                this.models.vrack = null;
            }.bind(this))
            .finally(function () {
                this.loaders.vrack.get = false;
            }.bind(this));
    };

    Controller.prototype.deletePrivateNetwork = function (privateNetwork) {
        var modal = this.resources.modal.open({
            templateUrl: "app/cloud/project/compute/infrastructure/privateNetwork/delete/cloud-project-compute-infrastructure-privateNetwork-delete.html",
            controller: "CloudprojectcomputeinfrastructureprivatenetworkdeleteCtrl",
            controllerAs: "CloudprojectcomputeinfrastructureprivatenetworkdeleteCtrl",
            resolve: {
                params: function () {
                    return privateNetwork;
                }
            }
        });
        modal.result.then(function () {
            this.deletePrivateNetworkFromList(privateNetwork);
        }.bind(this));
    };

    Controller.prototype.deletePrivateNetworkFromList = function (privateNetwork) {
        var newPrivateNetworks = this.collections.privateNetworks
            .filter(function(el){
                return el.id !== privateNetwork;
        });
        this.collections.privateNetworks = newPrivateNetworks;
        return this.collections;
    };

    Controller.prototype.createPrivateNetworks = function (event, args) {
        this.hideDialog();

        var subnets =  _.chain(args.subnets)
                        .values()
                        .filter(function (subnet) {
                            return _.contains(args.privateNetwork.regions, subnet.region);
                        })
                        .map(function (subnet) {
                            return _.assign(subnet, { dhcp: args.isDHCPEnabled, network: args.globalNetwork });
                        }).value();

        var onNetworkCreated = function (network) {
            var promises = _.map(subnets, function (subnet) {
                return this.service.saveSubnet(args.projectId, network.id, subnet).$promise;
            }, this);
            return this.$q.all(promises).then(function () {
                return this.fetchPrivateNetworks();
            }.bind(this));
        }.bind(this);

        this.service.savePrivateNetwork(args.projectId, args.privateNetwork, onNetworkCreated);
    };

    Controller.prototype.fetchPrivateNetworks = function () {
        if (this.loaders.privateNetworks.query) {
            return this.$q.when(null);
        }

        this.loaders.privateNetworks.query = true;

        return this.resources.privateNetwork.query({
            serviceName: this.serviceName
        }).$promise.then(function (networks) {
            this.collections.privateNetworks = networks;
            _.forEach(this.collections.privateNetworks, function (network) {
                if (network.id) {
                    network.shortVlanId = _.last(network.id.split("_"));
                }
            });
        }.bind(this)).catch(function () {
            this.collections.privateNetworks = [];
            this.toast.error(this.translate.instant("cpci_private_network_list_private_network_query_error"));
        }.bind(this)).finally(function () {
            this.loaders.privateNetworks.query = false;
        }.bind(this));
    };

    Controller.prototype.getPrivateNetworks = function () {
        return _.sortBy(this.collections.privateNetworks, "vlanId");
    };

    Controller.prototype.getVrackName = function () {
        if (_.has(this.models.vrack, "name") && !_.isEmpty(this.models.vrack.name)) {
            return this.models.vrack.name;
        } else if (_.has(this.models.vrack, "id") && !_.isEmpty(this.models.vrack.id)) {
            return this.models.vrack.id;
        } else {
            return this.translate.instant("cpci_private_network_list_vrack_unnamed");
        }
    };

    Controller.prototype.getVrackId = function () {
        if (_.has(this.models.vrack, "id") && !_.isEmpty(this.models.vrack.id)) {
            return this.$q.when(this.models.vrack.id);
        } else {
            if (_.isEmpty(this.models.vrack.name)) {
                return this.fetchPrivateNetworks()
                    .then(function () {
                        if (_.any(this.collections.privateNetworks)) {
                            return _.first(_.first(this.collections.privateNetworks).id.split("_"));
                        } else {
                            return this.$q.when(null);
                        }
                    }.bind(this));

            } else {
                return this.resources.aapi.query().$promise
                    .then(function (vracks) {
                        var vrack = _.find(vracks, { name: this.models.vrack.name });
                        return _.get(vrack, "id", null);
                    }.bind(this))
                    .catch(function () {
                        return null;
                    });
            }
        }
    };

    Controller.prototype.gotoVrack = function () {
        this.getVrackId().then(function (id) {
            this.$state.go("vrack", { vrackId: id });
        }.bind(this));
    };

    Controller.prototype.canGotoVrack = function () {
        return this.hasVrack() && !_.isNull(this.models.vrack.id);
    };

    Controller.prototype.hasVrack = function () {
        return this.loaders.vrack.get === false && !_.isNull(this.models.vrack);
    };

    Controller.prototype.showDialog = function () {
        this.states.dialog.visible = true;
    };

    Controller.prototype.hideDialog = function () {
        this.states.dialog.visible = false;
        this.$rootScope.$broadcast("highlighed-element.hide", "compute");
    };

    Controller.prototype.toggleDialog = function () {
        this.states.dialog.visible = !this.states.dialog.visible;
    };

    Controller.prototype.hasVisibleDialog = function () {
        return this.states.dialog.visible;
    };

    Controller.prototype.hasPendingLoaders = function () {
        return _.some(this.loaders, "query", true) ||
               _.some(this.loaders, "get", true)   ||
               this.isVrackCreating();
    };

    Controller.prototype.isVrackCreating = function () {
        return this.service.isSavePending();
    };

    Controller.prototype.onKeyDown = function ($event) {
        switch ($event.which) {
            case 27:
                //Important not to put $event.preventDefault(); before the switch statement since it will catch and prevent default
                //behavior on keyDown everywhere in the directive, inputs included.
                $event.preventDefault();
                this.hideDialog();
                break;
        }
    };

    return {
        restrict: "E",
        templateUrl: "app/cloud/project/compute/infrastructure/privateNetwork/cloud-project-compute-infrastructure-privateNetwork-list.html",
        controller: Controller,
        controllerAs: "$ctrl",
        bindToController: true,
        replace: false
    };
});
