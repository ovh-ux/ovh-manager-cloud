class VpsOrderVeeamCtrl {
    constructor ($scope, $stateParams, $translate, $window, CloudMessage, VpsService) {
        "use strict";
        this.serviceName = $stateParams.serviceName;

        $scope.model = {
            vps: null,
            optionDetails: null,
            url: null,
            contractsValidated: null
        };
        VpsService.getSelectedVps(this.serviceName)
            .then(data => {
                $scope.model.vps = data;
                VpsService.getVeeamOption(this.serviceName)
                    .then(veeamOption => {
                        $scope.model.optionDetails = veeamOption;
                        // TODO: Remove that !!!
                        VpsService.getPriceOptions($scope.model.vps).then(price => {
                            $scope.model.optionDetails.unitaryPrice = price.data.text;
                        });

                    });
            })
            .catch(data => {
                $scope.resetAction();
                $scope.setMessage($translate.instant("vps_configuration_veeam_order_step1_loading_error"), data);
            });


        $scope.orderOption = () => {
            if ($scope.model.optionDetails && $scope.model.contractsValidated) {
                VpsService.orderVeeamOption(this.serviceName, $scope.model.optionDetails.duration.duration)
                    .then(order => {
                        $scope.model.url = order.url;
                    }).catch(error => {
                        CloudMessage.error($translate.instant("vps_configuration_veeam_order_fail"));
                    });
            } else if ($scope.model.contractsValidated) {
                CloudMessage.error($translate.instant("vps_configuration_veeam_order_fail"));
            }
        };

        $scope.displayBC = function () {
            $scope.resetAction();
            $window.open($scope.model.url, "_blank");
        };
    }
}

angular.module("managerApp").controller("VpsOrderVeeamCtrl", VpsOrderVeeamCtrl);
