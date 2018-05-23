angular.module("managerApp")
    .component("cuiTileSubscription", {
        template: `
            <cui-tile 
                data-title="'common_tile_subscription' | translate"
                data-loading="$ctrl.loading"
                class="h-100">
                <cui-tile-body>
                    <cui-tile-item class="cui-tile__top-bordered"
                        data-ng-if="$ctrl.subscriptionInfo.offer" 
                        data-term="'common_tile_subscription_offer' | translate" 
                        data-description="$ctrl.subscriptionInfo.offer"
                        data-actions="$ctrl.offerActions"></cui-tile-item>
                    <cui-tile-item class="cui-tile__top-bordered"
                                   data-term="$ctrl.hasAutoRenew() ? 'common_tile_subscription_autorenew' : 'common_tile_subscription_expiration_date' | translate" 
                                   data-description="$ctrl.subscriptionInfo.expiration | momentFormat:'LL'"
                                   data-actions="$ctrl.autorenewActions"></cui-tile-item>
                    <cui-tile-item class="cui-tile__top-bordered"
                                   data-actions="$ctrl.contactActions">
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
                    <cui-tile-item class="cui-tile__top-bordered"
                                   data-term="'common_tile_subscription_creation_date' | translate" 
                                   data-description="$ctrl.subscriptionInfo.creation | momentFormat:'LL'"></cui-tile-item>
                </cui-tile-body>
            </cui-tile>
        `,
        controller: class {
            hasAutoRenew () {
                return this.subscriptionInfo.renew.forced || this.subscriptionInfo.renew.automatic;
            }
        },
        controllerAs: "$ctrl",
        bindings: {
            subscriptionInfo: "<",
            loading: "<",
            offerActions: "<",
            autorenewActions: "<",
            contactActions: "<"
        }
    });
