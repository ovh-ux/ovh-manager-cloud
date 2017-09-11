angular.module("managerApp")
.config(function (atInternetProvider, atInternetUiRouterPluginProvider, CONFIG) {
    "use strict";
    var trackingEnabled = CONFIG.env === "production";

    atInternetProvider.setEnabled(trackingEnabled);
    atInternetProvider.setDebug(!trackingEnabled);

    atInternetUiRouterPluginProvider.setTrackStateChange(true);
    atInternetUiRouterPluginProvider.addStateNameFilter(function (routeName) {
        return routeName ? routeName.replace(/\./g, "::") : "";
    });

})
.config(["$provide", function ($provide) {
    "use strict";

    $provide.decorator("atInternet", function ($delegate, $q, $cookies, User, TRACKING, TARGET) {
        var delegateTrackPage = $delegate.trackPage;
        var isDefaultConfigurationSet = false;
        var trackPageRequestArgumentStack = [];

        //Decorate trackPage to stack requests until At-internet default configuration is set
        $delegate.trackPage = function () {
            if (isDefaultConfigurationSet) {
                delegateTrackPage.apply($delegate, arguments);
            } else {
                trackPageRequestArgumentStack.push(arguments);
            }
        };

        User.Lexi().get().$promise.then(function (me) {
            var settings = angular.copy(TRACKING[TARGET].config);
            var referrerSite = $cookies.get("OrderCloud");
            if (referrerSite) {
                settings.referrerSite = referrerSite;
            }

            settings.countryCode = me.country;
            settings.currencyCode =  me.currency && me.currency.code;
            $delegate.setDefaults(settings);

            isDefaultConfigurationSet = true;

            _.forEach(trackPageRequestArgumentStack, function (trackPageArguments) {
                delegateTrackPage.apply($delegate, trackPageArguments);
            });

        }).catch(function (err) {
            $delegate.trackPage = function () {};
            trackPageRequestArgumentStack = [];
            $delegate.setEnabled(false);
            return $q.reject(err);
        });

        return $delegate;
    });
}])
