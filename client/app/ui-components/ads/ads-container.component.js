class CuiAdsContainerCtrl {
    $onInit () {
        this.messages = this.messages || [];
    }

    hasMessageToDisplay () {
        return _.some(this.messages, value => !value.dismissed);
    }

    onDismiss (message) {
        message.dismiss();
    }
}

angular.module("managerApp")
    .component("cuiAdsContainer", {
        templateUrl: "app/ui-components/ads/ads-container.html",
        controller: CuiAdsContainerCtrl,
        bindings: {
            messages: "<"
        }
    });

angular.module("managerApp").controller("CuiAdsContainerCtrl", CuiAdsContainerCtrl);
