class VpsReinstallService {
    constructor ($http, $translate, CloudMessage, OvhApiMe) {
        this.$http = $http;
        this.$translate = $translate;
        this.CloudMessage = CloudMessage;
        this.OvhApiMe = OvhApiMe;
    }

    getSshKeys () {
        return this.OvhApiMe.SshKey().Lexi().query().$promise;
    }

    getPackages (image) {
        this.$http.get("/distribution/image/vps/"+image)
        .then(response => { return this.filterKernel(response.data) })
        .catch(() => this.CloudMessage.error(this.$translate.instant("vps_configuration_reinstall_loading_summary_error")));
    }

    filterKernel (data) {
        const packages = data.packages;
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
            .catch(() => this.CloudMessage.error(this.$translate.instant("vps_configuration_reinstall_loading_summary_error")));
    }

}

angular.module("managerApp").service("VpsReinstallService", VpsReinstallService);
