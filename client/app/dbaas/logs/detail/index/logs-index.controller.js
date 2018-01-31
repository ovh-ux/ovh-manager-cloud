class LogsIndexCtrl {
    constructor ($stateParams, ControllerHelper, LogsIndexService) {
        this.$stateParams = $stateParams;
        this.serviceName = this.$stateParams.serviceName;
        this.ControllerHelper = ControllerHelper;
        this.LogsIndexService = LogsIndexService;
        this.initLoaders();
    }

    $onInit () {
        this.quota.load();
        this.indices.load();
    }

    initLoaders () {
        this.quota = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.LogsIndexService.getQuota(this.serviceName)
        });

        this.indices = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.LogsIndexService.getIndices(this.serviceName)
        });
    }

    edit (info) {
        // this.ControllerHelper.modal({

        // });
    }

    showDeleteConfirm (info) {
        this.LogsIndexService.deleteIndex(
            this.$stateParams.serviceName,
            info
        ).then(() => this.init());
    }
}

// preview (frontend) {
//     this.ControllerHelper.modal.showModal({
//         modalConfig: {
//             templateUrl: "app/iplb/frontends/preview/iplb-frontends-preview.html",
//             controller: "IpLoadBalancerFrontendPreviewCtrl",
//             controllerAs: "IpLoadBalancerFrontendPreviewCtrl",
//             resolve: {
//                 frontend: () => frontend
//             }
//         }
//     });
// }
angular.module("managerApp").controller("LogsIndexCtrl", LogsIndexCtrl);
