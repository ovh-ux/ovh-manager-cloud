class SessionService {
    constructor ($q, OvhApiMe, OvhApiProducts) {
        this.$q = $q;
        this.OvhApiMe = OvhApiMe;
        this.OvhApiProducts = OvhApiProducts;
    }

    getUser (force) {
        // Check if cached
        if (!!this.user) {
            return $q.when(this.user);
        }

        // Check if already deferred
        if (!!this.userDeferred && !force) {
            return this.userDeferred.promise;
        }

        // Get User
        this.userDeferred = this.$q.defer();
        this.OvhApiMe.Lexi()
            .get().$promise
            .then((result) => this.userDeferred.resolve(result));

        return this.userDeferred.promise;
    }

    getProducts (force) {
        // Check if cached
        if (!!this.products) {
            return $q.when(this.products);
        }

        // Check if already deferred
        if (!!this.productsDeferred && !force) {
            return this.productsDeferred.promise;
        }

        // Get Products
        this.productsDeferred = this.$q.defer();
        this.OvhApiProducts.Aapi()
            .get({ universe: "cloud" }).$promise
            .then((result) => this.productsDeferred.resolve(result));

        return this.productsDeferred.promise;
    }
}

angular.module("managerApp").service("SessionService", SessionService);
