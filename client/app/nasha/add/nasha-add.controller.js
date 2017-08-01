class NashaAddCtrl {
    constructor ($translate, $q, $state, Order, Toast) {
        this.$translate = $translate;
        this.$q = $q;
        this.$state = $state;
        this.Order = Order;
        this.Toast = Toast;

        this.loaders = {};
        this.enums = {};
        this.data = {};
    }

    $onInit () {
        this.loaders = {
            init: false,
            models: false,
            durations: false,
            loading: false
        };

        this.enums = {
            datacenters: [],
            models: [],
            availableDurationsForSelection: []
        };

        this.data = {
            selectedDatacenter: null,
            selectedModel: null,
            selectedDuration: null,
            order: null,
            orderValidated: false,
            completedOrder: null,
            modelsPriceInfo: null
        };

        this.init();
    }

    init () {
        this.loaders.init = true;
        this.Order.Lexi().schema()
            .$promise
            .then(data => {
                this.enums.datacenters = data.models["dedicated.NasHAZoneEnum"].enum;
                this.enums.models = data.models["dedicated.NasHAOfferEnum"].enum;

                this.enums.models = _.sortBy(self.enums.models, model => _.parseInt(model.slice(0, -1)));
                return this.$q.when();
            })
            .finally(() => { this.loaders.init = false; });
    }

    validateOrder () {
        this.loaders.loading = true;
        return this.getOrderInfoPromise(this.data.selectedDatacenter, this.data.selectedModel, this.data.selectedDuration)
            .then(order => {
                this.data.orderValidated = true;
                this.data.order = order;
            })
            .catch(err => {
                this.Toast.error(this.$translate.instant("nasha_order_validation_error"));
                return this.$q.reject(err);
            })
            .finally(() => { this.loaders.loading = false; });
    }

    onDataCenterSelectionChanged () {
        this.refreshModelsData();
        this.refreshDuration();
    }

    onModelSelectionChanged () {
        this.refreshDuration();
    }

    refreshDuration () {
        this.data.orderValidated = false;
        this.data.selectedDuration = "";
        if (this.data.selectedDatacenter && this.data.selectedModel) {
            this.enums.availableDurationsForSelection = [];
            this.loaders.durations = true;
            return this.getDurationsPromise(this.data.selectedModel)
                .then(durations => { this.enums.availableDurationsForSelection = durations; })
                .catch(err => {
                    this.Toast.error(this.$translate.instant("nasha_order_loading_error"));
                    return this.$q.reject(err);
                })
                .finally(() => { this.loaders.durations = false; });
        }

        return this.$q.when();
    }

    completeOrder () {
        this.Order.DedicatedNasha().New().Lexi().create({
            duration: this.data.selectedDuration
        }, {
            datacenter: this.data.selectedDatacenter,
            model: this.data.selectedModel
        }).$promise
            .then(data => {
                this.Toast.success(this.$translate.instant("nasha_order_success", { data: data }));
                this.data.completedOrder = data;
                this.$state.go("paas.nasha-order-complete", { orderUrl: data.url });
            })
            .catch(() => this.Toast.error(this.$translate.instant("nasha_order_error")))
            .finally(() => { this.loaders.init = false; });
    }

    getModelPrice (model) {
        const modelPriceInfo = { model, duration: "", price: null };
        return this.getDurationsPromise(model)
            .then(durations => this.$q.when(_.first(durations)))
            .then(firstDuration => {
                modelPriceInfo.duration = firstDuration;
                return this.getOrderInfoPromise(this.data.selectedDatacenter, model, firstDuration);
            })
            .then(orderInfo => {
                modelPriceInfo.price = orderInfo.prices.withoutTax;
                return this.$q.when(modelPriceInfo);
            })
            .catch(err => this.$q.reject(err));
    }

    refreshModelsData () {
        this.loaders.models = true;
        const modelsPriceQueue = [];
        _.forEach(this.enums.models, model => {
            modelsPriceQueue.push(this.getModelPrice(model));
        });

        this.$q.allSettled(modelsPriceQueue)
            .then(modelsPriceInfo => {
                const modelsPriceInfoObject = {};
                _.forEach(modelsPriceInfo, modelPriceInfo => {
                    modelsPriceInfoObject[modelPriceInfo.model] = modelPriceInfo;
                });
                this.data.modelsPriceInfo = modelsPriceInfoObject;
            })
            .finally(() => { this.loaders.models = false; });
    }

    getDurationsPromise (model) {
        return this.Order.DedicatedNasha().New().Lexi().query({
            datacenter: this.data.selectedDatacenter,
            model
        }).$promise.then(durations => this.$q.when(durations));
    }

    getOrderInfoPromise (datacenter, model, duration) {
        return this.Order.DedicatedNasha().New().Lexi().get({
            duration
        }, {
            datacenter,
            model
        }).$promise
            .then(order => this.$q.when(order))
            .catch(err => this.$q.reject(err));
    }
}

angular.module("managerApp").controller("NashaAddCtrl", NashaAddCtrl);
