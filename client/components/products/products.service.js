class ProductsService {
    constructor (OvhApiProducts) {
        this.OvhApiProducts = OvhApiProducts;
        this.products = {};
    }

    getProducts () {
        return this.OvhApiProducts.Aapi().get({
            universe: "cloud"
        })
            .$promise
            .then(products => {
                this.products = products.results;
                return products;
            });
    }

    getProductsOfType (type) {
        return _.result(_.find(this.products, service => service.name === type), "services");
    }

    getDisplayName (type, serviceName) {
        const services = this.getProductsOfType(type);
        return _.result(_.find(services, service => service.serviceName === serviceName), "displayName");
    }
}

angular.module("managerApp").service("ProductsService", ProductsService);
