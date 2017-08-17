angular.module("managerApp")
    .component("cuiTileSubscription", {
        template: `
            <cui-tile 
                data-title="'common_tile_subscription' | translate"
                data-loading="$ctrl.loading">
                <cui-tile-item data-term="'common_tile_subscription_offer' | translate" 
                    data-description="$ctrl.subscriptionInfo.offer"
                    data-actions="$ctrl.offerActions"></cui-tile-item>
                <cui-tile-item data-term="'common_tile_subscription_autorenew' | translate" 
                    data-description="$ctrl.subscriptionInfo.expiration | momentFormat:'LL'"
                    data-actions="$ctrl.autorenewActions"></cui-tile-item>
                <cui-tile-item data-term="'common_tile_subscription_contact' | translate" 
                    data-description="$ctrl.subscriptionInfo.contactAdmin"
                    data-actions="$ctrl.contactActions"></cui-tile-item>
                <cui-tile-item data-term="'common_tile_subscription_creation_date' | translate" 
                    data-description="$ctrl.subscriptionInfo.creation | momentFormat:'LL'"></cui-tile-item>
            </cui-tile>
        `,
        bindings: {
            subscriptionInfo: "<",
            loading: "<",
            offerActions: "<",
            autorenewActions: "<",
            contactActions: "<"
        }
    });
