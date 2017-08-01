angular.module("managerApp")
.config(function (ssoAuthenticationProvider, ssoAuthModalPluginFctProvider, $httpProvider, CONFIG_API) {
    "use strict";

    ssoAuthenticationProvider.setLoginUrl(CONFIG_API.loginUrl);
    ssoAuthenticationProvider.setLogoutUrl(CONFIG_API.loginUrl + "?action=disconnect");

    if (CONFIG_API.userUrl) {
        ssoAuthenticationProvider.setUserUrl(CONFIG_API.userUrl);
    }

    ssoAuthenticationProvider.setConfig(CONFIG_API.apis);

    $httpProvider.interceptors.push("ssoAuthInterceptor");

    // ssoAuthModalPluginFctProvider.setTranslationsPath("bower_components/sso-auth-modal-plugin/dist/modal");
})
.run(function ($rootScope, $state, ssoAuthentication) {
    "use strict";

    ssoAuthentication.login();

    // use of onStateChangeStart event to detect if state needs authentification - this is usefull when application is first runned

    ssoAuthentication.isLogged().then(function (isLogged) {
        $rootScope.$on("$stateChangeStart", function (event, toState) {

            var needToBeAuthenticate = toState.authenticate !== undefined ? toState.authenticate : true;

            if (needToBeAuthenticate && !isLogged) {
                event.preventDefault();
                ssoAuthentication.goToLoginPage();
            }

        });

    });
});
