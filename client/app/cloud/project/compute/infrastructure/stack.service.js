class CloudStackService {

    setFlavorsNumber (stack) {
        const total = _.sum(_.map(stack.resources.flavors, flavor => _.get(flavor, "count", 0)));
        _.set(stack, "flavors.total", total);
        return stack;
    }

    setPrice (stack, prices) {
        let hourlyPrice = 0;
        let monthlyPrice = 0;
        _.each(stack.resources.flavors, flavor => {
            hourlyPrice += _.get(flavor, "count", 0) * _.get(prices[`${flavor.flavor}.consumption`], "price.value", 0);
            monthlyPrice += _.get(flavor, "count", 0) * _.get(prices[`${flavor.flavor}.monthly`], "price.value", 0);
        });
        const price = { hourly: hourlyPrice, monthly: monthlyPrice };
        _.set(stack, "flavors.price", price);
        return stack;
    }
}

angular.module("managerApp").service("CloudStackService", CloudStackService);
