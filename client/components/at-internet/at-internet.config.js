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

