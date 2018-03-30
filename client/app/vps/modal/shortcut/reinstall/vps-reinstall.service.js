class VpsReinstallService {
    constructor ($http, $q, $translate, CloudMessage, OvhApiMe) {
        this.$http = $http;
        this.$q = $q;
        this.$translate = $translate;
        this.CloudMessage = CloudMessage;
        this.OvhApiMe = OvhApiMe;
    }

    getSshKeys () {
        return this.OvhApiMe.SshKey().v6().query().$promise;
    }

    getPackages (image) {
        return this.$http.get("/distribution/image/vps/"+image)
        .then(response => response.data.packages)
        .catch(err => this.$q.reject(err));
    }

    filterKernel (packages) {
        return _.filter(packages, pkg => {
            return !_.includes((pkg.name + pkg.alias).toLowerCase(), "kernel");
        });
    }

    getPackagesFiltered (image) {
        const filteredPackages = [];
        this.$http.get("/distribution/image/vps/"+image)
            .then(response => {
                const packages = response.data.packages;
                _.filter(packages, pkg => {
                    if (!_.includes((pkg.name + pkg.alias).toLowerCase(), "kernel")) {
                        packages.push(pkg);
                    }
                });
                return packages;
            })
            .catch(err => this.$q.reject(err));
    }

}

angular.module("managerApp").service("VpsReinstallService", VpsReinstallService);
