class ManagerNavbarService {
  /* @ngInject */
  constructor(
    $injector,
    $q,
    $rootScope,
    $translate,
    atInternet,
    CucFeatureAvailabilityService,
    LANGUAGES,
    MANAGER_URLS,
    NavbarBuilder,
    NavbarNotificationService,
    OtrsPopupService,
    CucProductsService,
    REDIRECT_URLS,
    SessionService,
    ssoAuthentication,
    coreConfig,
    TranslateService,
    URLS,
    asyncLoader,
  ) {
    this.$injector = $injector;
    this.$q = $q;
    this.$rootScope = $rootScope;
    this.$translate = $translate;
    this.atInternet = atInternet;
    this.featureAvailabilityService = CucFeatureAvailabilityService;
    this.LANGUAGES = LANGUAGES;
    this.MANAGER_URLS = MANAGER_URLS;
    this.NavbarBuilder = NavbarBuilder;
    this.navbarNotificationService = NavbarNotificationService;
    this.otrsPopupService = OtrsPopupService;
    this.productsService = CucProductsService;
    this.REDIRECT_URLS = REDIRECT_URLS;
    this.sections = {
      iaas: ['PROJECT', 'VPS', 'SERVER', 'DEDICATED_CLOUD', 'HOUSING'],
      paas: ['CEPH', 'KUBE', 'NAS', 'NASHA', 'CDN', 'VEEAM', 'VEEAM_ENTERPRISE'],
      metrics: 'METRICS',
      vracks: 'VRACK',
      loadBalancer: 'LOAD_BALANCER',
      cloudDesktop: 'CLOUD_DESKTOP',
      logsDataPlatform: 'DBAAS_LOGS',
    };
    this.sessionService = SessionService;
    this.ssoAuthentication = ssoAuthentication;
    this.coreConfig = coreConfig;
    this.translateService = TranslateService;
    this.URLS = URLS;
    this.asyncLoader = asyncLoader;
  }

  getProducts(products) {
    const getServices = (section, products) => { // eslint-disable-line
      // If only one section (string), return a simple array
      if (_.isString(section)) {
        return _.map(_.get(_.find(products, { name: section }), 'services'));
      }

      // Return object of all sections
      const services = _.map(section, serviceType => _.map(_.get(_.find(products, { name: serviceType }), 'services')));
      return _.zipObject(section, services);
    };

    return {
      iaas: getServices(this.sections.iaas, products),
      paas: getServices(this.sections.paas, products),
      metrics: getServices(this.sections.metrics, products),
      vracks: getServices(this.sections.vracks, products),
      loadBalancer: getServices(this.sections.loadBalancer, products),
      cloudDesktop: getServices(this.sections.cloudDesktop, products),
      logsDataPlatform: getServices(this.sections.logsDataPlatform, products),
    };
  }

  static getProductsMenu(categoryName, products) {
    return _.map(products, product => ({
      title: product.displayName,
      state: categoryName,
      stateParams: {
        serviceName: product.serviceName,
      },
    }));
  }

  getSectionTitle(section) {
    switch (section) {
      case 'PROJECT':
        return this.$translate.instant('cloud_sidebar_section_cloud_project');
      case 'VPS':
        return this.$translate.instant('cloud_sidebar_section_vps');
      case 'SERVER':
        return this.$translate.instant('cloud_sidebar_section_dedicated_server');
      case 'DEDICATED_CLOUD':
        return this.$translate.instant('cloud_sidebar_section_dedicated_cloud');
      case 'HOUSING':
        return this.$translate.instant('cloud_sidebar_section_housing');
      case 'CEPH':
        return this.$translate.instant('cloud_sidebar_section_paas_cda');
      case 'NAS':
        return this.$translate.instant('cloud_sidebar_section_nas');
      case 'NASHA':
        return this.$translate.instant('cloud_sidebar_section_nasha');
      case 'CDN':
        return this.$translate.instant('cloud_sidebar_section_cdn');
      case 'VEEAM':
        return this.$translate.instant('cloud_sidebar_section_paas_veeam');
      case 'VEEAM_ENTERPRISE':
        return this.$translate.instant('cloud_sidebar_section_paas_veeam_enterprise');
      case 'KUBE':
        return this.$translate.instant('cloud_sidebar_section_paas_kube');
      default:
        return '';
    }
  }

  getIaasMenu(products) {
    return _.map(this.sections.iaas, section => ({
      name: `iaas.${section}`,
      title: this.getSectionTitle(section),
      subLinks: !products[section].length ? null : _.map(products[section], (service) => {
        switch (section) {
          case 'PROJECT':
            return {
              name: service.serviceName,
              title: service.displayName,
              state: 'iaas.pci-project.compute.infrastructure.diagram',
              stateParams: {
                projectId: service.serviceName,
              },
            };
          case 'VPS':
            return {
              title: service.displayName,
              state: 'iaas.vps.detail.dashboard',
              stateParams: {
                serviceName: service.serviceName,
              },
            };
          case 'SERVER':
            return {
              title: service.displayName,
              url: this.REDIRECT_URLS.dedicatedServersPage.replace('{server}', service.serviceName),
            };
          case 'DEDICATED_CLOUD':
            return {
              title: service.displayName,
              url: this.REDIRECT_URLS.dedicatedCloudPage.replace('{pcc}', service.serviceName),
            };
          case 'HOUSING':
            return {
              title: service.displayName,
              url: this.REDIRECT_URLS.housing.replace('{housing}', service.serviceName),
            };
          default:
            return '';
        }
      }),
    }));
  }

  getPaasMenu(products) {
    return _.map(this.sections.paas, section => ({
      name: `paas.${section}`,
      title: this.getSectionTitle(section),
      subLinks: !products[section].length ? null : _.map(products[section], (service) => {
        switch (section) {
          case 'CEPH':
            return {
              title: service.displayName,
              state: 'paas.cda.cda-details.cda-details-home',
              stateParams: {
                serviceName: service.serviceName,
              },
            };
          case 'KUBE':
            return {
              title: service.displayName,
              state: 'paas.kube.service',
              stateParams: {
                serviceName: service.serviceName,
              },
            };
          case 'NAS':
            return {
              title: service.displayName,
              url: this.REDIRECT_URLS.nasPage.replace('{nas}', service.serviceName),
            };
          case 'NASHA':
            return {
              title: service.displayName,
              state: 'paas.nasha.nasha-partitions',
              stateParams: {
                nashaId: service.serviceName,
              },
            };
          case 'CDN':
            return {
              title: service.displayName,
              url: this.REDIRECT_URLS.cdnPage.replace('{cdn}', service.serviceName),
            };
          case 'VEEAM':
            return {
              title: service.displayName,
              state: 'paas.veeam.detail.dashboard',
              stateParams: {
                serviceName: service.serviceName,
              },
            };
          case 'VEEAM_ENTERPRISE':
            return {
              title: service.displayName,
              state: 'paas.veeam-enterprise.dashboard',
              stateParams: {
                serviceName: service.serviceName,
              },
            };
          default:
            return '';
        }
      }),
    }));
  }

  static getCloudDesktopMenu(categoryName, products) {
    return _.map(products, product => ({
      title: (product.displayName === 'noAlias') ? product.serviceName : product.displayName,
      state: categoryName,
      stateParams: {
        serviceName: product.serviceName,
      },
    }));
  }

  getUniverseMenu(products) {
    const universeProducts = this.getProducts(products);
    const universeMenu = [{
      // Iaas
      name: 'iaas',
      title: this.$translate.instant('cloud_sidebar_section_iaas'),
      subLinks: this.getIaasMenu(universeProducts.iaas),
    }, {
      // Paas
      name: 'paas',
      title: this.$translate.instant('cloud_sidebar_section_paas'),
      subLinks: this.getPaasMenu(universeProducts.paas),
    }, {
      // Metrics
      name: 'dbaas.metrics',
      title: this.$translate.instant('cloud_sidebar_section_metrics'),
      subLinks: this.constructor.getProductsMenu('dbaas.metrics.detail.dashboard', universeProducts.metrics),
    }, {
      // Logs
      name: 'dbaas.logs',
      title: this.$translate.instant('cloud_sidebar_section_logs'),
      subLinks: this.constructor.getProductsMenu('dbaas.logs.detail', universeProducts.logsDataPlatform),
    }, {
      // Licences (Link)
      title: this.$translate.instant('cloud_sidebar_section_license'),
      url: this.REDIRECT_URLS.license,
    }, {
      // IP (Link)
      title: this.$translate.instant('cloud_sidebar_section_ip'),
      url: this.REDIRECT_URLS.ip,
    }, {
      // Load Balancer
      name: 'network.iplb',
      title: this.$translate.instant('cloud_sidebar_section_load_balancer'),
      subLinks: this.constructor.getProductsMenu('network.iplb.detail.home', universeProducts.loadBalancer),
    }, {
      // vRack
      name: 'vrack',
      title: this.$translate.instant('cloud_sidebar_section_vrack'),
      subLinks: _.map(universeProducts.vracks, product => ({
        title: product.displayName,
        state: 'vrack',
        stateParams: {
          vrackId: product.serviceName,
        },
      })),
    }];

    // Cloud Desktop
    if (this.featureAvailabilityService.hasFeature('CLOUD_DESKTOP', 'sidebarMenu', this.locale)) {
      universeMenu.push({
        name: 'deskaas',
        title: this.$translate.instant('cloud_sidebar_section_cloud_desktop'),
        subLinks: this.constructor.getCloudDesktopMenu('deskaas.details', universeProducts.cloudDesktop),
      });
    }

    return universeMenu;
  }

  getAssistanceMenu(subsidiary) {
    const mustDisplayNewMenu = ['FR'].includes(subsidiary);
    const mustDisplayChatbot = ['FR'].includes(subsidiary);

    const assistanceMenuItems = [
      {
        title: this.$translate.instant('common_menu_support_guide'),
        url: _.get(this.URLS, `guides.cloud.${subsidiary}`),
        isExternal: true,
        click: () => this.atInternet.trackClick({
          name: 'assistance::all_guides::cloud',
          type: 'action',
        }),
        mustBeKept: !mustDisplayNewMenu && _.has(this.URLS, `guides.cloud.${subsidiary}`),
      },
      {
        title: this.$translate.instant('common_menu_support_all_guides'),
        url: _.get(this.URLS, `guides.home.${subsidiary}`),
        isExternal: true,
        click: () => this.atInternet.trackClick({
          name: 'assistance::all_guides',
          type: 'action',
        }),
        mustBeKept: !mustDisplayNewMenu && !_.has(this.URLS, `guides.cloud.${subsidiary}`) && _.has(this.URLS, `guides.home.${subsidiary}`),
      },
      {
        title: this.$translate.instant('common_menu_support_help_center'),
        url: _.get(this.URLS, 'support.FR'),
        isExternal: true,
        click: () => this.atInternet.trackClick({
          name: 'assistance::all_guides',
          type: 'action',
        }),
        mustBeKept: mustDisplayNewMenu && _.has(this.URLS, 'support.FR'),
      },
      {
        title: this.$translate.instant('common_menu_support_new_ticket'),
        click: (callback) => {
          if (!this.otrsPopupService.isLoaded()) {
            this.otrsPopupService.init();
          } else {
            this.otrsPopupService.toggle();
          }

          this.atInternet.trackClick({
            name: 'assistance::create_assistance_request',
            type: 'action',
          });

          if (_.isFunction(callback)) {
            callback();
          }
        },
        mustBeKept: !mustDisplayNewMenu,
      },
      {
        title: this.$translate.instant('common_menu_support_ask_for_assistance'),
        url: _.get(this.REDIRECT_URLS, 'support', ''),
        click: () => this.atInternet.trackClick({
          name: 'assistance::assistance_requests_created',
          type: 'action',
        }),
        mustBeKept: mustDisplayNewMenu && _.has(this.REDIRECT_URLS, 'support'),
      },
      {
        title: this.$translate.instant('common_menu_support_list_ticket'),
        url: _.get(this.REDIRECT_URLS, 'support', ''),
        click: () => this.atInternet.trackClick({
          name: 'assistance::assistance_requests_created',
          type: 'action',
        }),
        mustBeKept: !mustDisplayNewMenu && _.has(this.REDIRECT_URLS, 'support'),
      },
      {
        title: this.$translate.instant('common_menu_support_telephony_contact'),
        url: _.get(this.URLS, 'support_contact', {})[subsidiary] || _.get(this.URLS, 'support_contact.FR'),
        isExternal: true,
        click: () => this.atInternet.trackClick({
          name: 'assistance::helpline',
          type: 'action',
        }),
        mustBeKept: this.coreConfig.getRegion() !== 'US',
      },
      {
        title: `${this.$translate.instant('common_menu_support_chatbot')} <sup class="oui-color-california">OVH Chat</sup>`,
        click: () => {
          this.$rootScope.$broadcast('ovh-chatbot:open');
          this.atInternet.trackClick({
            name: 'assistance::helpline',
            type: 'action',
          });
        },
        mustBeKept: mustDisplayChatbot,
      },
    ];

    const useExpandedText = ['FR'].includes(subsidiary);

    return (useExpandedText
      ? this.NavbarBuilder.buildMenuHeader(this.$translate.instant('common_menu_support_assistance_expanded'))
      : this.$q.when(this.$translate.instant('common_menu_support_assistance'))
    )
      .then(title => ({
        name: 'assistance',
        title,
        headerTitle: useExpandedText ? this.$translate.instant('common_menu_support_assistance_expanded') : title,
        iconClass: 'icon-assistance',
        onClick: () => this.atInternet.trackClick({
          name: 'assistance',
          type: 'action',
        }),
        subLinks: assistanceMenuItems.filter(menuItem => menuItem.mustBeKept),
      }));
  }

  getLanguageMenu() {
    const currentLanguage = _.find(
      this.LANGUAGES.available,
      {
        key: this.translateService.getUserLocale(),
      },
    );

    return {
      name: 'languages',
      label: _(currentLanguage).get('name'),
      class: 'oui-navbar-menu_language',
      title: _(currentLanguage).get('key').split('_')[0].toUpperCase(),
      headerTitle: this.$translate.instant('common_menu_language'),
      subLinks: _.map(this.LANGUAGES.available, lang => ({
        title: lang.name,
        isActive: lang.key === currentLanguage.key,
        click: () => {
          this.translateService.setUserLocale(lang.key);
          window.location.reload();
        },
        lang: _.chain(lang.key).words().head().value(),
      })),
    };
  }

  trackUserMenuSection(name, chapter2) {
    this.atInternet.trackClick({
      name,
      type: 'action',
      chapter1: 'account',
      chapter2,
    });
  }

  getUserMenu(currentUser) {
    const useExpandedText = ['FR'].includes(currentUser.ovhSubsidiary);

    return (useExpandedText
      ? this.NavbarBuilder.buildMenuHeader(`
      ${this.$translate.instant('common_menu_support_userAccount_1', { username: currentUser.firstname })}
      <br>
      ${this.$translate.instant('common_menu_support_userAccount_2')}
    `)
      : this.$q.when(currentUser.firstname))
      .then(title => ({
        name: 'user',
        title,
        iconClass: 'icon-user',
        nichandle: currentUser.nichandle,
        fullName: `${currentUser.firstname} ${currentUser.name}`,
        subLinks: [
        // My Account
          {
            name: 'user.account',
            title: this.$translate.instant('common_menu_account'),
            url: this.REDIRECT_URLS.userInfos,
            click: () => this.trackUserMenuSection('my_account', 'account'),
            subLinks: [{
              title: this.$translate.instant('common_menu_account_infos'),
              url: this.REDIRECT_URLS.userInfos,
            }, {
              title: this.$translate.instant('common_menu_account_security'),
              url: this.REDIRECT_URLS.userSecurity,
            },
            (this.coreConfig.getRegion() === 'EU' || this.coreConfig.getRegion() === 'CA') && {
              title: this.$translate.instant('common_menu_account_emails'),
              url: this.REDIRECT_URLS.userEmails,
            },
            (this.coreConfig.getRegion() === 'EU') && {
              title: this.$translate.instant('common_menu_account_subscriptions'),
              url: this.REDIRECT_URLS.userSubscriptions,
            }, {
              title: this.$translate.instant('common_menu_account_ssh'),
              url: this.REDIRECT_URLS.userSSH,
            }, {
              title: this.$translate.instant('common_menu_account_advanced'),
              url: this.REDIRECT_URLS.userAdvanced,
            }],
          },

          // Billing
          !currentUser.isEnterprise && {
            name: 'user.billing',
            title: this.$translate.instant('common_menu_billing'),
            url: this.REDIRECT_URLS.billing,
            click: () => this.trackUserMenuSection('my_facturation', 'billing'),
            subLinks: [{
              title: this.$translate.instant('common_menu_billing_history'),
              url: this.REDIRECT_URLS.billing,
            }, {
              title: this.$translate.instant('common_menu_billing_payments'),
              url: this.REDIRECT_URLS.billingPayments,
            }],
          },

          // Services
          (this.coreConfig.getRegion() === 'EU' || this.coreConfig.getRegion() === 'CA') && (!currentUser.isEnterprise ? {
            name: 'user.services',
            title: this.$translate.instant('common_menu_renew'),
            url: this.REDIRECT_URLS.services,
            click: () => this.trackUserMenuSection('my_services', 'services'),
            subLinks: [{
              title: this.$translate.instant('common_menu_renew_management'),
              url: this.REDIRECT_URLS.services,
            }, {
              title: this.$translate.instant('common_menu_renew_agreements'),
              url: this.REDIRECT_URLS.servicesAgreements,
            }],
          } : {
            title: this.$translate.instant('common_menu_renew_agreements'),
            url: this.REDIRECT_URLS.servicesAgreements,
          }),

          // Payment
          !currentUser.isEnterprise && {
            name: 'user.payment',
            title: this.$translate.instant('common_menu_means'),
            url: this.REDIRECT_URLS.paymentMeans,
            click: () => this.trackUserMenuSection('my_payment_types', 'payment_types'),
            subLinks: [{
              title: this.$translate.instant('common_menu_means_mean'),
              url: this.REDIRECT_URLS.paymentMeans,
            },
            (this.coreConfig.getRegion() === 'EU' || this.coreConfig.getRegion() === 'CA') && {
              title: this.$translate.instant('common_menu_means_ovhaccount'),
              url: this.REDIRECT_URLS.ovhAccount,
            },
            (this.coreConfig.getRegion() === 'EU' || this.coreConfig.getRegion() === 'CA') && {
              title: this.$translate.instant('common_menu_means_vouchers'),
              url: this.REDIRECT_URLS.billingVouchers,
            }, {
              title: this.$translate.instant('common_menu_means_refunds'),
              url: this.REDIRECT_URLS.billingRefunds,
            },
            (this.coreConfig.getRegion() === 'EU') && {
              title: this.$translate.instant('common_menu_means_fidelity'),
              url: this.REDIRECT_URLS.billingFidelity,
            }, {
              title: this.$translate.instant('common_menu_means_credits'),
              url: this.REDIRECT_URLS.billingCredits,
            }],
          },

          // Orders
          (!currentUser.isEnterprise && this.coreConfig.getRegion() === 'EU' && currentUser.ovhSubsidiary === 'FR') && {
            title: this.$translate.instant('common_menu_orders'),
            url: this.REDIRECT_URLS.orders,
            click: () => this.trackUserMenuSection('my_orders', 'orders'),
          },

          // Contacts
          (this.coreConfig.getRegion() === 'EU') && {
            title: this.$translate.instant('common_menu_contacts'),
            url: this.REDIRECT_URLS.contacts,
            click: () => this.trackUserMenuSection('my_contacts', 'contacts'),
          },

          // Logout
          {
            title: this.$translate.instant('global_logout'),
            class: 'logout',
            click: (callback) => {
              this.ssoAuthentication.logout();

              if (typeof callback === 'function') {
                callback();
              }
            },
          },
        ],
      }));
  }

  getInternalLinks(currentUser, notificationsMenu) {
    return (currentUser
      ? this.$q.all([
        this.getLanguageMenu(),
        this.getAssistanceMenu(currentUser.ovhSubsidiary),
        this.getUserMenu(currentUser),
      ])
      : this.$q.when([{
        title: this.$translate.instant('common_login'),
        click: () => this.ssoAuthentication.logout(),
      }])
    )
      .then((menuLinks) => {
        const menu = menuLinks;

        if (notificationsMenu.show) {
          menu.splice(1, 0, notificationsMenu);
        }

        return menu;
      });
  }

  getManagersNames() {
    switch (this.coreConfig.getRegion()) {
      case 'EU': {
        if (this.locale === 'FR') {
          return ['portal', 'web', 'dedicated', 'cloud', 'telecom', 'gamma', 'partners'];
        }

        return ['portal', 'web', 'dedicated', 'cloud', 'telecom', 'gamma'];
      }
      case 'CA': {
        return ['dedicated', 'cloud', 'gamma'];
      }
      case 'US':
      default: {
        return ['dedicated', 'cloud'];
      }
    }
  }

  loadTranslations() {
    return this.$translate.refresh();
  }

  // Get managers links for main-links attribute
  getManagerLinks(products) {
    const currentUniverse = 'cloud';
    const managerUrls = this.MANAGER_URLS;
    const managerNames = this.getManagersNames();

    return _.map(managerNames, (managerName) => {
      const managerLink = {
        name: managerName,
        class: managerName,
        title: this.$translate.instant(`common_menu_${managerName}`),
        url: managerUrls[managerName],
        isPrimary: ['partners', 'labs'].indexOf(managerName) === -1,
      };

      if (products && managerName === currentUniverse) {
        managerLink.subLinks = this.getUniverseMenu(products);
      }

      return managerLink;
    });
  }

  // Get products and build responsive menu
  getResponsiveLinks() {
    return this.productsService.getProducts()
      .then(({ results }) => this.getManagerLinks(results))
      .catch(() => this.getManagerLinks());
  }

  // Get navbar navigation and user infos
  getNavbar() {
    const managerUrls = this.MANAGER_URLS;

    // Get base structure for the navbar
    const getBaseNavbar = (user, notifications) => {
      this.locale = user.ovhSubsidiary;

      return this.getInternalLinks(user, notifications)
        .then(internalLinks => ({
          // Set OVH Logo
          brand: {
            label: this.$translate.instant('common_menu_cloud'),
            url: managerUrls.cloud,
            iconAlt: 'OVH',
            iconClass: 'navbar-logo',
            iconSrc: 'assets/images/navbar/icon-logo-ovh.svg',
          },

          // Set Internal Links
          internalLinks,

          // Set Manager Links
          managerLinks: this.getManagerLinks(),
        }));
    };

    return this.loadTranslations()
      .then(() => this.sessionService.getUser())
      .then(user => this.navbarNotificationService.getNavbarContent(user)
        .then(notifications => getBaseNavbar(user, notifications)))
      .catch(() => getBaseNavbar());
  }
}

angular.module('managerApp').service('ManagerNavbarService', ManagerNavbarService);
