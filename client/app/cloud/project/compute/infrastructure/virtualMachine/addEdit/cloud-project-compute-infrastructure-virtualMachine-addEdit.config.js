"use strict";
/**
 *  Configuration for at-internet tracking
 **/
angular.module("managerApp")
    .config(function (atInternetControllerDecoratorsProvider) {

        var quotaReasons = ["QUOTA_VCPUS", "QUOTA_RAM", "QUOTA_INSTANCE"];
        atInternetControllerDecoratorsProvider.decorate({
            CloudProjectComputeInfrastructureVirtualMachineAddEditCtrl: {
                viewFlavorsList: function (atInternet, controller, parameters) {
                    var category = _.find(controller.displayData.categories, { category : parameters [1]});
                    var isSomeFlavorsDisabled = _.some(category.flavors, function (flavor) {
                        return _.includes(quotaReasons, flavor.disabled);
                    });

                    if (isSomeFlavorsDisabled) {
                        atInternet.trackEvent({
                            event: "over-quota-low",
                            page: "cloud::cloud-project::compute::infrastructure::order"
                        });
                    }
                },
                onMouseEnterFlavor:  function (atInternet, controller, parameters) {
                    if (_.includes(quotaReasons, parameters[1].disabled)) {
                        atInternet.trackEvent({
                            event: "over-quota-high",
                            page: "cloud::cloud-project::compute::infrastructure::order"
                        });
                    }
                }
            }
        });
    });
