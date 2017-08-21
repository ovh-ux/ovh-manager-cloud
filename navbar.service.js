(() => {
    "use strict";

    class NavbarService {
        constructor ($translate, atInternet, User, OtrsPopupService, ssoAuthentication, TranslateService,
                     LANGUAGES, TARGET, MANAGER_URLS, REDIRECT_URLS, URLS) {
            this.$translate = $translate;
            this.atInternet = atInternet;
            this.User = User;
            this.TranslateService = TranslateService;
            this.OtrsPopupService = OtrsPopupService;
            this.ssoAuthentication = ssoAuthentication;
            this.LANGUAGES = LANGUAGES;
            this.MANAGER_URLS = MANAGER_URLS;
            this.REDIRECT_URLS = REDIRECT_URLS;
            this.URLS = URLS;
            this.TARGET = TARGET;
            this.menuItems = {};
        }

        init () {
            this.menuItems = {
                dedicated: {
                    label: this.$translate.instant("common_menu_dedicated"),
                    universe: "dedicated",
                    url: this.MANAGER_URLS.dedicated
                },
                cloud: {
                    label: this.$translate.instant("common_menu_cloud"),
                    universe: "cloud",
                    url: this.MANAGER_URLS.cloud
                },
                sunrise: {
                    label: this.$translate.instant("common_menu_gamma"),
                    universe: "gamma",
                    url: this.MANAGER_URLS.sunrise
                },
                portal: {
                    label: this.$translate.instant("common_menu_portal"),
                    universe: "portal",
                    url: this.MANAGER_URLS.portal
                },
                web: {
                    label: this.$translate.instant("common_menu_web"),
                    universe: "web",
                    url: this.MANAGER_URLS.web
                },
                telecom: {
                    label: this.$translate.instant("common_menu_telecom"),
                    universe: "telecom",
                    url: this.MANAGER_URLS.telecom
                },
                labs: {
                    universe: "labs",
                    icon: "fa fa-flask fs24 white",
                    title: this.$translate.instant("common_menu_labs"),
                    click: () => {
                        this.atInternet.trackClick({
                            name: "uxlabs_chatbot_menu"
                        });
                        window.location = this.MANAGER_URLS.labs;
                    }
                },
                partners: {
                    label: this.$translate.instant("common_menu_partners"),
                    universe: "partners",
                    url: this.MANAGER_URLS.partners
                },
                newTicket: {
                    label: this.$translate.instant("common_menu_support_new_ticket"),
                    click: () => {
                        if (!this.OtrsPopupService.isLoaded()) {
                            this.OtrsPopupService.init();
                        } else {
                            this.OtrsPopupService.toggle();
                        }
                    }
                },
                ticketList: {
                    label: this.$translate.instant("common_menu_support_list_ticket"),
                    url: "#/support"
                },
                phone: {
                    label: this.$translate.instant("common_menu_support_telephony_contact"),
                },
                billing: {
                    label: this.$translate.instant("common_menu_billing"),
                    url: this.REDIRECT_URLS.billing
                },
                account: {
                    label: this.$translate.instant("common_menu_account"),
                    url: this.REDIRECT_URLS.userInfos
                },
                renew: {
                    label: this.$translate.instant("common_menu_renew"),
                    url: this.REDIRECT_URLS.services
                },
                orders: {
                    label: this.$translate.instant("common_menu_orders"),
                    url: this.REDIRECT_URLS.orders
                },
                logout: {
                    label: this.$translate.instant("global_logout"),
                    click: () => this.ssoAuthentication.logout()
                },
                login: {
                    label: this.$translate.instant("common_login"),
                    click: () => this.ssoAuthentication.logout()
                }
            };
        }

        createManagersMenu () {
            const menus = [];
            switch (this.TARGET) {
            case "EU": {
                menus.push(this.menuItems.portal);
                menus.push(this.menuItems.web);
                menus.push(this.menuItems.dedicated);
                menus.push(this.menuItems.cloud);
                menus.push(this.menuItems.telecom);
                menus.push(this.menuItems.sunrise);
                this.User.Lexi().get().$promise.then(user => {
                    if (user.ovhSubsidiary === "FR") {
                        menus.push(this.menuItems.partners);
                        menus.push(this.menuItems.labs);
                    }
                });
                break;
            }
            case "CA": {
                menus.push(this.menuItems.dedicated);
                menus.push(this.menuItems.cloud);
                menus.push(this.menuItems.sunrise);
                break;
            }
            case "US":
            default: {
                menus.push(this.menuItems.dedicated);
                menus.push(this.menuItems.cloud);
            }
            }
            return menus;
        }

        createAssistanceMenu (locale) {
            const assistanceMenu = {};
            assistanceMenu.label = this.$translate.instant("common_menu_support_assistance");
            assistanceMenu.subLinks = [];


            const cloudGuide = _.get(this.URLS.guides, `cloud.${locale}`);
            const homeGuide = _.get(this.URLS.guides, `home.${locale}`);
            const frenchHomeGuide = _.get(this.URLS.guides, "home.FR");
            if (cloudGuide) {
                assistanceMenu.subLinks.push({
                    label: this.$translate.instant("common_menu_support_guide"),
                    url: cloudGuide
                });
            } else if (homeGuide) {
                assistanceMenu.subLinks.push({
                    label: this.$translate.instant("common_menu_support_all_guides"),
                    url: homeGuide
                });
            } else if (frenchHomeGuide) {
                assistanceMenu.subLinks.push({
                    label: this.$translate.instant("common_menu_support_all_guides"),
                    url: frenchHomeGuide
                });
            }

            if (this.TARGET !== "US") {
                this.menuItems.phone.url = this.URLS.support_contact[locale] || this.URLS.support_contact.FR;
                // add other assistance links
                assistanceMenu.subLinks = assistanceMenu.subLinks.concat([
                    this.menuItems.newTicket,
                    this.menuItems.ticketList,
                    this.menuItems.phone
                ]);
            }
            return assistanceMenu;
        }

        createBillingMenu () {
            return this.menuItems.billing;
        }

        createLanguageMenu () {
            const languageMenu = {};

            const selectedLang = _.find(this.LANGUAGES.available, { key: this.TranslateService.getUserLocale() });
            languageMenu.label = selectedLang ? selectedLang.name : this.$translate.instant("common_menu_language");
            languageMenu.subLinks = [];
            _.each(this.LANGUAGES.available, lang => {
                languageMenu.subLinks.push({
                    label: lang.name,
                    click: () => {
                        this.TranslateService.setUserLocale(lang.key);
                        window.location.reload();
                    }
                });
            });
            return languageMenu;
        }

        createUserMenu (user) {
            const userMenu = {};
            userMenu.label = user ? `${user.firstname} ${user.name} (${user.nichandle})` : this.$translate.instant("common_not_logged_in");
            userMenu.subLinks = [];
            userMenu.subLinks.push(this.menuItems.account);
            userMenu.subLinks.push(this.menuItems.billing);
            if (this.TARGET === "EU") {
                userMenu.subLinks.push(this.menuItems.renew);
            }
            userMenu.subLinks.push(this.menuItems.orders);
            userMenu.subLinks.push(this.menuItems.logout);
            return userMenu;
        }

        createLoginMenu () {
            return this.menuItems.login;
        }
    }

    angular.module("managerApp").service("NavbarService", NavbarService);
})();
