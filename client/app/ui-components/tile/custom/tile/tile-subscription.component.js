angular.module("managerApp")
    .component("cuiTileSubscription", {
        template: `
            <cui-tile 
                data-title="'common_tile_subscription' | translate"
                data-loading="$ctrl.loading"
                class="h-100">
                <cui-tile-body>
                    <cui-tile-item data-ng-if="$ctrl.subscriptionInfo.offer" 
                        data-term="'common_tile_subscription_offer' | translate" 
                        data-description="$ctrl.subscriptionInfo.offer"
                        data-actions="$ctrl.offerActions"></cui-tile-item>
                    <cui-tile-item data-term="'common_tile_subscription_autorenew' | translate" 
                        data-description="$ctrl.subscriptionInfo.expiration | momentFormat:'LL'"
                        data-actions="$ctrl.autorenewActions"></cui-tile-item>
                    <cui-tile-item data-actions="$ctrl.contactActions">
                        <cui-tile-definitions>
                            <cui-tile-definition-term data-term="'common_tile_subscription_contact' | translate"></cui-tile-definition-term>
                            <cui-tile-definition-description>
                                <span data-ng-bind="$ctrl.subscriptionInfo.contactAdmin"></span>
                                <small data-translate="common_tile_subscription_contact_admin"></small>
                            </cui-tile-definition-description>
                            <cui-tile-definition-description>
                                <span data-ng-bind="$ctrl.subscriptionInfo.contactBilling"></span>
                                <small data-translate="common_tile_subscription_contact_billing"></small>
                            </cui-tile-definition-description>
                            <cui-tile-definition-description>
                                <span data-ng-bind="$ctrl.subscriptionInfo.contactTech"></span>
                                <small data-translate="common_tile_subscription_contact_technical"></small>
                            </cui-tile-definition-description>
                        </cui-tile-definitions>
                    </cui-tile-item>
                    <cui-tile-item data-term="'common_tile_subscription_creation_date' | translate" 
                        data-description="$ctrl.subscriptionInfo.creation | momentFormat:'LL'"></cui-tile-item>
                </cui-tile-body>
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
