angular.module("managerApp")
.config(function (atInternetProvider, atInternetUiRouterPluginProvider, CONFIG) {
    "use strict";
    var trackingEnabled = CONFIG.env === "production";

    atInternetProvider.setEnabled(trackingEnabled);
    atInternetProvider.setDebug(!trackingEnabled);

    atInternetUiRouterPluginProvider.setTrackStateChange(true);
    atInternetUiRouterPluginProvider.addStateNameFilter(function (routeName) {
        var prefix = "cloud";
        var route = routeName ? routeName.replace(/\./g, "::") : "";
        return `${prefix}::${route}`;
    });

})
.run(($cookies, atInternet, TRACKING, TARGET, OvhApiMe) => {
    "use strict";

    let config = TRACKING[TARGET].config;
    const referrerSite = $cookies.get("OrderCloud");

    if (referrerSite) {
        config.referrerSite = referrerSite;
    }
    
    OvhApiMe.Lexi().get().$promise
        .then(me => {
            config.countryCode = me.country;
            config.currencyCode =  me.currency && me.currency.code;
            config.visitorId = me.customerCode;
            atInternet.setDefaults(config);
        });
});
