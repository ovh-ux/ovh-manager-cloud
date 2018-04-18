angular.module("managerApp")
    .config((ssoAuthenticationProvider, ssoAuthModalPluginFctProvider, $httpProvider, CONFIG_API) => {
        ssoAuthenticationProvider.setLoginUrl(CONFIG_API.loginUrl);
        ssoAuthenticationProvider.setLogoutUrl(`${CONFIG_API.loginUrl}?action=disconnect`);

        if (CONFIG_API.userUrl) {
            ssoAuthenticationProvider.setUserUrl(CONFIG_API.userUrl);
        }

        ssoAuthenticationProvider.setConfig(CONFIG_API.apis);

        $httpProvider.interceptors.push("ssoAuthInterceptor");

    // ssoAuthModalPluginFctProvider.setTranslationsPath("bower_components/sso-auth-modal-plugin/dist/modal");
    })
    .run(($transitions, ssoAuthentication) => {
        ssoAuthentication.login();

        // use of onStateChangeStart event to detect if state needs authentification - this is useful when application is first runned

        ssoAuthentication.isLogged().then(isLogged => {
            $transitions.onStart({}, transition => {
                const toState = transition.to();

                const needToBeAuthenticate = toState.authenticate !== undefined ? toState.authenticate : true;

                if (needToBeAuthenticate && !isLogged) {
                    event.preventDefault();
                    ssoAuthentication.goToLoginPage();
                }

            });

        });
    });
