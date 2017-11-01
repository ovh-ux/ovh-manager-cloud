angular.module("managerApp").service("Products", [
    "$rootScope",
    "$http",
    "$q",
    "TARGET",
    "$stateParams",
    "CONFIG",
    function ($rootScope, $http, $q, TARGET, $stateParams, CONFIG) {
        "use strict";

        var products = null,
            productsByType = null,
            selectedProduct = {
                name : "",
                type : ""
            },
            requests = {
                productsList : null
            };

        $rootScope.$on("global_display_name_change", function(evt, params) {
            var result = _.find(products, {name: params.serviceName});
            result.displayName = angular.copy(params.displayName);
        });

        function resetCache() {
            products = null;
            productsByType = null;
            requests.productsList = null;
        }

        /*
         * get product by SWS
         */
        this.getProducts = function (forceRefresh) {

            if (forceRefresh === true) {
                resetCache();
            }

            return $q.when(products).then(function () {

                if (!products) {

                    if (requests.productsList === null) {

                        requests.productsList = $http.get("/sws/products", {
                            serviceType: "aapi",
                            params: {
                                universe: "DEDICATED",
                                worldPart: TARGET
                            }
                        }).then(function (result) {
                            if (result.status < 300) {
                                productsByType = result.data;

                                if (!products) {
                                    products = [];
                                }

                                ["dedicatedServers","dedicatedClouds","vps","exchanges","networks"].forEach(function (type) {
                                    products = products.concat(productsByType[type]);
                                });
                                return products;
                            } else {
                                return $q.reject(result);
                            }
                        });
                    }

                    return requests.productsList;
                } else {
                    return products;
                }
            }).then(function () {
                return products;
            }, function (reason) {
                return $q.reject(reason);
            });
        };

        /*
         * Get list of products orderBy Type
         */
        this.getProductsByType = function () {
            return this.getProducts().then(function () {
                return productsByType;
            });
        };

        /*
         * Get the selected product
         */
        this.getSelectedProduct = function (forceRefresh) {
            return this.getProducts(forceRefresh).then(function (productsList) {                
                if (selectedProduct.name === null || selectedProduct.name === undefined || selectedProduct.name === "") {
                    //selectedProduct.name = $stateParams.productId ? $stateParams.productId : "";
                    selectedProduct.name = $stateParams.serviceName ? $stateParams.serviceName : "";
                    if (selectedProduct.name === "") {
                        return {
                            name : "",
                            type : ""
                        };
                    }
                }

                return _.find(productsList, {name: selectedProduct.name});
            });
        };

        /*
         * set the selected product by Id
         */
        this.setSelectedProduct = function (product) {
            if (product) {
                if (angular.isString(product)) {
                    selectedProduct.name = product;
                } else if (angular.isObject(product)) {
                    if (product.name === "" && product.type === "") {
                        selectedProduct = product;
                    } else {
                        selectedProduct.name = product.name;
                    }
                }
            }
            return this.getSelectedProduct().then(function (p) {
                selectedProduct.type = p.type;
                $rootScope.$broadcast("changeSelectedProduct", p);
                return p;
            });
        };

        /*
         * set the selected product by Id
         */
        this.removeSelectedProduct = function () {
            return this.setSelectedProduct({
                name : "",
                type : ""
            }).then(function (p) {
                $rootScope.$broadcast("removeSelectedProduct");
                return p;
            });
        };

        /**
         * Get working-status for the specified product
         */
        this.getWorks = function (category, affiliated, active) {
            var prod = CONFIG.env !== "development" ? "/engine/2api/" : "engine/2api/";
            return $http.get(prod + "working-status/" + category, {
                params: {
                    affiliated: affiliated,
                    active: active
                }
            })
                .then(function (resp) {
                    console.log(resp);
                    return resp.data;
                });
        };

        this.getProducts(true);
    }
]);
