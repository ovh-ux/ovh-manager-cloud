class CloudProjectAddService {
    constructor ($q, OvhApiCloud) {
        this.$q = $q;
        this.OvhApiCloud = OvhApiCloud;
    }

    getCloudProjectOrders () {
        return this.OvhApiCloud.Lexi().order().$promise;
    }

    getCloudProjectOrder (orderId) {
        return this.$q.when({
            orderId: 84860952,
            date: "2018-02-08T17:18:50.709102+01:00",
            status: "delivered",
            serviceName: "4b447e05950f42758232bd08544bb2ee",
            planCode: "project"
        });
        /** return this.getCloudProjectOrders()
            .then(response => {
                return  _.filter(response, order => order.orderId === orderId);
            }); **/
    }
}

angular.module("managerApp").service("CloudProjectAddService", CloudProjectAddService);
