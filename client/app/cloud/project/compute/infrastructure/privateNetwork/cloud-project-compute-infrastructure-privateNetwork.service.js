class CloudProjectComputeInfrastructurePrivateNetworkService {
    constructor ($q, $timeout, $translate, Toast, URLS, User, CloudProjectRegion, CloudProjectNetworkPrivate, CloudProjectNetworkPrivateSubnet) {
        this.$q = $q;
        this.$timeout = $timeout;
        this.$translate = $translate;
        this.Toast = Toast;
        this.URLS = URLS;
        this.User = User;
        this.Region = CloudProjectRegion;
        this.CloudProjectNetworkPrivate = CloudProjectNetworkPrivate;
        this.Subnet = CloudProjectNetworkPrivateSubnet;

        this.loaders = {
            privateNetwork: {
                query: false,
                get: false
            },
            region: {
                query: false
            },
            url: false,
            save: false,
            delete: false
        };

        this.urls = {
            api: null
        };

        this.constraints = {
            name: {
                required: true,
                trim: true,
                maxlength: 256
            },
            vlanId: {
                required: true,
                min: 2,
                max: 4000,
                debounce: 50
            },
            subnet: {
                address: {
                    required: true,
                    trim: true
                },
                mask: {
                    required: true,
                    min: 1,
                    max: 32,
                    trim: true
                },
                start: {
                    required: true,
                    trim: true
                },
                end: {
                    required: true,
                    trim: true
                }
            },
            region: {
                required: false
            }
        };

        this.states = {
            retries: 0
        };
    }

    fetchPrivateNetworks (serviceName) {
        this.loaders.privateNetwork.query = true;
        this.CloudProjectNetworkPrivate.Lexi().resetCache();
        
        return this.CloudProjectNetworkPrivate.Lexi().query({
            serviceName: serviceName
        }).$promise.catch(() => this.Toast.error(this.$translate.instant("cpcipnd_fetch_private_networks_error")))
                   .finally(() => this.loaders.privateNetwork.query = false);
    }

    arePrivateNetworksLoading () {
        return this.loaders.privateNetwork.query === true;
    }

    fetchPrivateNetwork (serviceName, id) {
        this.loaders.privateNetwork.get = true;
        this.CloudProjectNetworkPrivate.Lexi().resetCache();

        return this.CloudProjectNetworkPrivate.Lexi().get({
            serviceName: serviceName,
            networkId: id
        }).$promise.catch(() => this.Toast.error(this.$translate.instant("cpcipnd_fetch_private_network_error")))
                   .finally(() => this.loaders.privateNetwork.get = false);
    }

    isPrivateNetworkLoading () {
        return this.loaders.privateNetwork.get === true;
    }

    fetchRegions (serviceName) {
        this.loaders.region.query = true;

        return this.Region.Lexi().query({
            serviceName: serviceName
        }).$promise
          .catch(() => this.Toast.error(this.$translate.instant("cpcipnd_fetch_regions_error")))
          .finally(() => this.loaders.region.query = false);
    }

    areRegionsLoading () {
        return this.loaders.region.query === true;
    }

    fetchUrls () {
        this.loaders.url = true;

        return this.User.Lexi().get().$promise
          .then(me => this.urls.api = this.URLS.guides.vlans[me.ovhSubsidiary].api)
          .catch(() => this.urls.api = this.URLS.guides.vlans.FR.api)
          .finally(() => this.loaders.url = false);
    }

    areUrlsLoading () {
        return this.loaders.url === true;
    }

    getUrls () {
        return this.urls;
    }

    savePrivateNetwork (projectId, privateNetwork, onSuccess) {
        this.loaders.save = true;

        return this.CloudProjectNetworkPrivate.Lexi().save(_.assign(privateNetwork, {
            serviceName: projectId
        })).$promise.then(network => {
            const options = {
                serviceName: projectId,
                privateNetworkId: network.id,
                status: "ACTIVE"
            };

            this.states.retries = 0;

            this.pollPrivateNetworkStatus(options, () => {
                this.loaders.save = false;
                onSuccess(network, options);
            }, error => {
                this.loaders.save = false;
                this.Toast.error(this.$translate.instant("cpcipnd_poll_error", {
                    message: error.data.message || JSON.stringify(error)
                }));
            });
        }).catch(error => {
            this.Toast.error(this.$translate.instant("cpcipnd_save_error", {
                message: error.data.message || JSON.stringify(error)
            }));
            this.loaders.save = false;
        });
    }

    pollPrivateNetworkStatus (options, onSuccess, onFailure) {
        this.$timeout(() => {
            if (this.isPrivateNetworkLoading()) {
                return;
            }

            this.CloudProjectNetworkPrivate.Lexi().resetCache();

            this.fetchPrivateNetwork(
                options.serviceName,
                options.privateNetworkId
            ).then(network => {
                if (this.areAllRegionsActive(network)) {
                    onSuccess(network, options);
                } else {
                    this.pollPrivateNetworkStatus(options, onSuccess, onFailure);
                }
            }).catch(error => onFailure(error));
        }, options.delay || 2000);
    }

    saveSubnet (projectId, networkId, subnet) {
        this.loaders.save = true;

        return this.Subnet.Lexi().save(_.assign(subnet, {
            serviceName: projectId,
            networkId: networkId
        })).$promise
        .catch(error => {
            this.Toast.error(this.$translate.instant("cpcipnd_save_error", {
                message: error.data.message || JSON.stringify(error)
            }));
        }).finally(() => this.loaders.save = false);
    }

    isSavePending () {
        return this.loaders.save === true;
    }

    getConstraints () {
        return this.constraints;
    }

    areAllRegionsActive (network) {
        return (network.status === "ACTIVE") &&
                network.regions &&
                _.every(network.regions, function (region) {
                    return region.status === "ACTIVE";
                });
    }

    deleteProjectNetworkPrivate (serviceName, networkId) {
        this.loaders.delete = true;
        return this.CloudProjectNetworkPrivate.Lexi().delete({
            serviceName: serviceName,
            networkId: networkId
        }).$promise.catch(error => {
            return this.$q.reject(error);
        }).finally(() => this.loaders.delete = false);
    }

    isDeletePending () {
        return this.loaders.delete === true;
    }
}



angular.module("managerApp").service("CloudProjectComputeInfrastructurePrivateNetworkService", CloudProjectComputeInfrastructurePrivateNetworkService);
