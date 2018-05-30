class ProductsService {
    constructor ($q, OvhApiProducts) {
        this.$q = $q;
        this.OvhApiProducts = OvhApiProducts;
        this.products = {};
        this.productsDeferred = null;
    }

    getProducts (force) {
        if (!_.isEmpty(this.products)) {
            return this.$q.when(this.products);
        }

        if (!_.isNull(this.productsDeferred) && !force) {
            return this.productsDeferred.promise;
        }

        this.productsDeferred = this.$q.defer();

        this.OvhApiProducts.Aapi().get({
            universe: "cloud"
        })
            .$promise
            .then(products => {
                this.products = products;
                this.productsDeferred.resolve(this.products);
            });

        return this.productsDeferred.promise;
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
