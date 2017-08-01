angular.module("managerApp")
    .run(function (atInternet, managerNavbar, $translate, $translatePartialLoader, $q, $uibModal, User, OtrsPopupService, TranslateService, LANGUAGES, TARGET, MANAGER_URLS, REDIRECT_URLS, URLS, ssoAuthentication) {

        $translatePartialLoader.addPart("common");
        $translatePartialLoader.addPart("changelog");
        $translatePartialLoader.addPart("module-otrs");

        function createEUMenu(commonMenus) {
            var menus = [];

            var portalMenu = {
                label: $translate.instant("common_menu_portal"),
                universe: "portal",
                url: MANAGER_URLS.portal
            };

            var webMenu = {
                label: $translate.instant("common_menu_web"),
                universe: "web",
                url: MANAGER_URLS.web
            };

            var telecomMenu = {
                label: $translate.instant("common_menu_telecom"),
                universe: "telecom",
                url: MANAGER_URLS.telecom
            };

            var labsMenu = {
                universe: "labs",
                icon: "fa fa-flask fs24 white",
                title: $translate.instant("common_menu_labs"),
                "click": function () {
                    atInternet.trackClick({
                        name: "uxlabs_chatbot_menu"
                    });
                    window.location = MANAGER_URLS.labs;
                }
            };

            var partnersMenu = {
                label: $translate.instant("common_menu_partners"),
                universe: "partners",
                url: MANAGER_URLS.partners
            };

            menus.push(portalMenu);
            menus.push(webMenu);
            menus.push(commonMenus.dedicated);
            menus.push(commonMenus.cloud);
            menus.push(telecomMenu);
            menus.push(commonMenus.sunrise);

            User.Lexi().get().$promise.then(function (user) {
                if (user.ovhSubsidiary === "FR") {
                    menus.push(partnersMenu);
                    menus.push(labsMenu);
                }
            });


            return menus;
        }

        function createCAMenu(commonMenus) {
            return [commonMenus.dedicated, commonMenus.cloud, commonMenus.sunrise];
        }

        function createUSMenu(commonMenus) {
            return [commonMenus.dedicated, commonMenus.cloud];
        }

        function createMenu() {
            var commonMenus;
            if (TARGET === "EU" || TARGET === "CA" || TARGET === "US") {
                commonMenus = {};

                commonMenus.dedicated = {
                    label: $translate.instant("common_menu_dedicated"),
                    universe: "dedicated",
                    url: MANAGER_URLS.dedicated
                };

                commonMenus.cloud = {
                    label: $translate.instant("common_menu_cloud"),
                    universe: "cloud",
                    url: MANAGER_URLS.cloud
                };

                commonMenus.sunrise = {
                    label: $translate.instant("common_menu_gamma"),
                    universe: "gamma",
                    url: MANAGER_URLS.sunrise
                };

                if (TARGET === "EU") {
                    managerNavbar.setExternalLinks(createEUMenu(commonMenus));
                } else if (TARGET === "CA") {
                    managerNavbar.setExternalLinks(createCAMenu(commonMenus));
                } else if (TARGET === "US") {
                    managerNavbar.setExternalLinks(createUSMenu(commonMenus));
                }
            }
        }

        function createAssistanceMenu (locale) {
            var assistanceMenu = {
                "label": $translate.instant("common_menu_support_assistance"),
                "subLinks": []
            };

            // check if cloud guide is available
            if (URLS.guides.cloud[locale]) {
                assistanceMenu.subLinks.push({
                    "label": $translate.instant("common_menu_support_guide"),
                    "url": URLS.guides.cloud[locale]
                });
                // no cloud guide available, display "all guides" link instead
            } else {
                assistanceMenu.subLinks.push({
                    "label": $translate.instant("common_menu_support_all_guides"),
                    "url": URLS.guides.home[locale] || URLS.guides.home.FR
                });
            }

            if (TARGET !== "US") {

                // add other assistance links
                assistanceMenu.subLinks = assistanceMenu.subLinks.concat([
                    {
                        "label": $translate.instant("common_menu_support_new_ticket"),
                        click: function () {
                            if (!OtrsPopupService.isLoaded()) {
                                OtrsPopupService.init();
                            } else {
                                OtrsPopupService.toggle();
                            }
                        }
                    }, {
                        "label": $translate.instant("common_menu_support_list_ticket"),
                        "url": "#/support"
                    },
                    /*{
                     'label' : $translate.instant('common_menu_support_email_history'),
                     'url' : '#/otrsEmail'
                     },*/
                    {
                        "label": $translate.instant("common_menu_support_telephony_contact"),
                        "url": URLS.support_contact[locale] || URLS.support_contact.FR
                    }, {
                        "label": $translate.instant("common_menu_support_changelog"),
                        "click": function () {
                            $uibModal.open({
                                templateUrl: "app/changelog/changelog.html",
                                controller: "ChangelogController",
                                controllerAs: "ChangelogCtrl"
                            });
                        }
                    }
                ]);
            }
            return assistanceMenu;

        }

        $q.allSettled([$translate.refresh(), User.Lexi().get().$promise]).then(function (resp) {
            return resp && resp[1] || {};
        }, function (resp) {
            return resp && resp[1] || {};
        }).then(function (user) {

            createMenu();

            var assistanceMenu = createAssistanceMenu(user.ovhSubsidiary);
            if (assistanceMenu) {
                managerNavbar.internalLinks.push(assistanceMenu);
            }

            angular.forEach([
                {
                    "label": $translate.instant("common_menu_billing"),
                    "url": REDIRECT_URLS.billing
                }, {
                    "label": (function () {
                        var selectedLang = _.find(LANGUAGES.available, { key: TranslateService.getUserLocale() });
                        return selectedLang ? selectedLang.name : $translate.instant("common_menu_language");
                    })(),
                    "subLinks": (function () {
                        var subLinksLang = [];
                        angular.forEach(LANGUAGES.available, function (lang) {
                            subLinksLang.push({
                                "label": lang.name,
                                "click": function () {
                                    TranslateService.setUserLocale(lang.key);
                                    window.location.reload();
                                }
                            });
                        });
                        return subLinksLang;
                    })()
                }, {
                    "label": user.firstname + " " + user.name + " (" + user.nichandle + ")",
                    "subLinks": (function () {
                        var accountMenu = [
                            {
                                "label": $translate.instant("common_menu_account"),
                                "url": REDIRECT_URLS.userInfos
                            }, {
                                "label": $translate.instant("common_menu_billing"),
                                "url": REDIRECT_URLS.billing
                            }
                        ];

                        if (TARGET === "EU") {
                            accountMenu.push({
                                "label": $translate.instant("common_menu_renew"),
                                "url": REDIRECT_URLS.services
                            });
                        }

                        accountMenu.push({
                            "label": $translate.instant("common_menu_orders"),
                            "url": REDIRECT_URLS.orders
                        });
                        accountMenu.push({
                            "label": $translate.instant("global_logout"),
                            "click": function () {
                                ssoAuthentication.logout();
                            }
                        });

                        return accountMenu;
                    })()
                }
            ], function (link) {
                managerNavbar.internalLinks.push(link);
            });

        });
    });
