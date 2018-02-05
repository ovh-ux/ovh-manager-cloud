class VrackService {

    constructor ($q, ControllerHelper, OvhApiVrack) {
        this.$q = $q;
        this.ControllerHelper = ControllerHelper;
        this.OvhApiVrack = OvhApiVrack;
    }

    getGroupedServiceTypes () {
        return ["dedicatedCloudDatacenter", "dedicatedCloud", "dedicatedServerInterface"];
    }

    isGroupedServiceType (serviceType) {
        return _.includes(this.getGroupedServiceTypes(), serviceType);
    }

    getVracks () {
        this.OvhApiVrack.Aapi().resetCache();
        return this.OvhApiVrack.Aapi().query().$promise.then(vracks => {
            _.map(vracks, vrack => {
                vrack.serviceName = vrack.id;
                vrack.displayName = vrack.name || vrack.id;
            });
            return vracks;
        });
    }

    getOrderUrl () {
        return this.ControllerHelper.navigation.getConstant("website_order.vrack");
    }

    addToVrackModal (vRacks, orderUrl) {
        return this.ControllerHelper.modal.showModal({
            modalConfig: {
                templateUrl: "app/vrack/addToVrack/addToVrack.html",
                controller: "AddToVrackCtrl",
                controllerAs: "$ctrl",
                resolve: {
                    params: () => ({
                        orderUrl,
                        vRacks
                    })
                }
            }
        });
    }

    /**
     *  add selected existing vRack to private network
     *
     * @memberof AddVRackCtrl
     */
    addCloudProjectToVrack (selectedVrack, projectId) {
        return this.OvhApiVrack.CloudProject().Lexi().create({
            serviceName: selectedVrack
        }, {
            project: projectId
        }).$promise
            .then(vrack => {
                vrack.data.id = vrack.data.serviceName;
                console.log(vrack.data);
                return vrack.data;
            });
    }

    addVrack () {
        return this.$q.all({
            orderUrl: this.getOrderUrl(),
            vracks: this.getVracks()
        })
            .then(data => this.addToVrackModal(data.vracks, data.orderUrl));
    }
}

angular.module("managerApp").service("VrackService", VrackService);
