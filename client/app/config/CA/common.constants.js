"use strict";

angular.module("managerApp")
    .constant("TARGET", "CA")
    .constant("UNIVERSE", "CLOUD")
    .constant("MANAGER_URLS", {
        dedicated: "https://ca.ovh.com/manager/index.html#/",
        cloud: "https://ca.ovh.com/manager/cloud/index.html#/",
        sunrise: "https://ca.ovh.com/manager/sunrise/index.html#/",
        gamma: "https://ca.ovh.com/manager/sunrise/index.html#/",
        portal: "https://www.ovh.com/manager/portal/index.html#/"
    })
    .constant("REDIRECT_URLS", {
        support: "https://ca.ovh.com/manager/index.html#/ticket",
        billing: "https://ca.ovh.com/manager/index.html#/billing/history",
        billingPayments: "https://ca.ovh.com/manager/index.html#/billing/payments",
        billingMean: "https://ca.ovh.com/manager/index.html#/billing/mean",
        billingVouchers: "https://ca.ovh.com/manager/index.html#/billing/vouchers",
        billingRefunds: "https://ca.ovh.com/manager/index.html#/billing/refunds",
        billingFidelity: "https://ca.ovh.com/manager/index.html#/billing/fidelity",
        billingCredits: "https://ca.ovh.com/manager/index.html#/billing/credits",
        ordersInProgress: "https://ca.ovh.com/manager/index.html#/billing/orders?status=in-progress",
        orders: "https://ca.ovh.com/manager/index.html#/billing/orders?status=all",
        services: "https://ca.ovh.com/manager/index.html#/billing/autoRenew",
        servicesAgreements: "https://ca.ovh.com/manager/index.html#/useraccount/agreements",
        paymentMeans: "https://ca.ovh.com/manager/index.html#/billing/mean",
        addCreditCard: "https://ca.ovh.com/manager/index.html#/billing/mean/add?meanType=creditCard",
        ovhAccount: "https://ca.ovh.com/manager/index.html#/billing/ovhaccount",
        debtAccount: "https://ca.ovh.com/manager/index.html#/billing/statements",
        userInfos: "https://ca.ovh.com/manager/index.html#/useraccount/infos",
        userSecurity: "https://ca.ovh.com/manager/index.html#/useraccount/security",
        userEmails: "https://ca.ovh.com/manager/index.html#/useraccount/emails",
        userSubscriptions: "https://ca.ovh.com/manager/index.html#/useraccount/subscriptions",
        userSSH: "https://ca.ovh.com/manager/index.html#/useraccount/ssh",
        userAdvanced: "https://ca.ovh.com/manager/index.html#/useraccount/advanced",
        contacts: null, // not yet available to CA users
        horizon: "https://horizon.cloud.ovh.net/openstackdashboard?username={username}",
        ipAction: "https://ca.ovh.com/manager/index.html#/configuration/ip?action={action}&ip={ip}&ipBlock={ipBlock}",
        vRack: "https://ca.ovh.com/manager/index.html#/configuration/vrack?landingTo=networks",
        nas: "https://ca.ovh.com/manager/index.html#/configuration/nas?landingTo=networks",
        nasPage: "https://ca.ovh.com/manager/index.html#/configuration/nas/nas/nas_{nas}?landingTo=networks",
        ip: "https://ca.ovh.com/manager/index.html#/configuration/ip?landingTo=ip",
        license: "https://ca.ovh.com/manager/index.html#/configuration/license?landingTo=licences",
        housing: "https://www.ovh.com/manager/dedicated/index.html#/configuration/housing/{housing}?landingTo=dedicatedServers",
        dedicatedServers: "https://ca.ovh.com/manager/index.html#/configuration?landingTo=dedicatedServers",
        dedicatedServersPage: "https://ca.ovh.com/manager/index.html#/configuration/server/{server}?landingTo=dedicatedServers",
        dedicatedCloud: "https://ca.ovh.com/manager/index.html#/configuration?landingTo=dedicatedClouds",
        dedicatedCloudPage: "https://ca.ovh.com/manager/index.html#/configuration/dedicated_cloud/{pcc}?landingTo=dedicatedClouds",
        cloudDesktop: null, // not yet available to CA users
        vps: "https://ca.ovh.com/manager/index.html#/configuration?landingTo=vps",
        vpsPage: "https://ca.ovh.com/manager/index.html#/configuration/vps/{vps}?landingTo=vps",
        networks: "https://ca.ovh.com/manager/index.html#/configuration?landingTo=networks",
        cdnPage: "https://ca.ovh.com/manager/index.html#/configuration/cdn/{cdn}?landingTo=networks",
        renew: "https://ca.ovh.com/cgi-bin/order/renew.cgi?domainChooser={serviceName}"
    })
    .constant("DOCS_ALL_GUIDES", {
        ASIA: "https://docs.ovh.com/asia/en/",
        AU: "https://docs.ovh.com/au/en/",
        CA: "https://docs.ovh.com/ca/en/",
        QC: "https://docs.ovh.com/ca/fr/",
        SG: "https://docs.ovh.com/sg/en/",
        WE: "https://docs.ovh.com/ca/en/",
        WS: "https://docs.ovh.com/ca/fr/"
    })
    .constant("DOCS_HOMEPAGE_GUIDES", {
        DEFAULT: {
            PROJECT: {
                title: "homepage_type_of_guide_pci",
                list: [{
                    text: "guide_project_1",
                    atInternetClickTag: "TopGuide-PublicCloud-1",
                    isExternal: true,
                    href: "https://docs.ovh.com/gb/en/public-cloud/getting_started_with_public_cloud_logging_in_and_creating_a_project/"
                }, {
                    text: "guide_project_5",
                    atInternetClickTag: "TopGuide-PublicCloud-5",
                    isExternal: true,
                    href: "https://docs.ovh.com/gb/en/public-cloud/configure_user_access_to_horizon/"
                }, {
                    text: "guide_project_6",
                    atInternetClickTag: "TopGuide-PublicCloud-6",
                    isExternal: true,
                    href: "https://docs.ovh.com/gb/en/public-cloud/start-a-first-cloud-server-within-3-min/"
                }, {
                    text: "guide_project_7",
                    atInternetClickTag: "TopGuide-PublicCloud-7",
                    isExternal: true,
                    href: "https://docs.ovh.com/gb/en/public-cloud/prepare_the_environment_for_using_the_openstack_api/"
                }, {
                    text: "guide_project_8",
                    atInternetClickTag: "TopGuide-PublicCloud-8",
                    isExternal: true,
                    href: "https://docs.ovh.com/gb/en/public-cloud/create_and_configure_an_additional_disk_on_an_instance/"
                }, {
                    text: "guide_project_all",
                    atInternetClickTag: "TopGuide-PublicCloud-all",
                    isExternal: true,
                    href: "https://docs.ovh.com/gb/en/public-cloud/"
                }]
            },
            VPS: {
                title: "homepage_type_of_guide_vps",
                list: [{
                    text: "guide_vps_1",
                    atInternetClickTag: "TopGuide-VPS-1",
                    isExternal: true,
                    href: "https://docs.ovh.com/gb/en/vps/getting-started-vps/"
                }, {
                    text: "guide_vps_2",
                    atInternetClickTag: "TopGuide-VPS-2",
                    isExternal: true,
                    href: "https://docs.ovh.com/gb/en/vps/tips-for-securing-a-vps/"
                }, {
                    text: "guide_vps_3",
                    atInternetClickTag: "TopGuide-VPS-3",
                    isExternal: true,
                    href: "https://docs.ovh.com/gb/en/vps/repartitioning-vps-after-upgrade/"
                }, {
                    text: "guide_vps_4",
                    atInternetClickTag: "TopGuide-VPS-4",
                    isExternal: true,
                    href: "https://docs.ovh.com/gb/en/vps/use-kvm-for-vps/"
                }, {
                    text: "guide_vps_5",
                    atInternetClickTag: "TopGuide-VPS-5",
                    isExternal: true,
                    href: "https://docs.ovh.com/gb/en/vps/windows-first-config/"
                }, {
                    text: "guide_vps_7",
                    atInternetClickTag: "TopGuide-VPS-7",
                    isExternal: true,
                    href: "https://docs.ovh.com/gb/en/vps/root-password/"
                }, {
                    text: "guide_vps_8",
                    atInternetClickTag: "TopGuide-VPS-8",
                    isExternal: true,
                    href: "https://docs.ovh.com/gb/en/vps/rescue/"
                }, {
                    text: "guide_vps_all",
                    atInternetClickTag: "TopGuide-VPS-9",
                    isExternal: true,
                    href: "https://docs.ovh.com/gb/en/vps/"
                }]
            }
        }
    })
// CA eq to en_CA
// QC eq to fr_CA
// WS eq to es_US
// AU eq to en_CA
// SG eq to en_GB
// ASIA eq to en_GB
    .constant("URLS", {
        support: {
            ASIA: "https://www.ovh.com/asia/support/",
            AU: "https://www.ovh.com.au/support/",
            CA: "https://www.ovh.co.uk/support/",
            QC: "https://www.ovh.com/fr/support/",
            SG: "https://www.ovh.com/sg/support/",
            WE: "https://www.ovh.co.uk/support/",
            WS: "https://www.ovh.com/fr/support/"
        },
        support_contact: {
            ASIA: "https://www.ovh.com/asia/support/",
            AU: "https://www.ovh.com.au/support/",
            CA: "https://www.ovh.com/ca/en/support/",
            QC: "https://www.ovh.com/ca/fr/support/",
            SG: "https://www.ovh.com/sg/support/",
            WE: "https://www.ovh.com/ca/en/support/",
            WS: "https://www.ovh.com/ca/en/support/"
        },
        website_order: {
            vps: {
                ASIA: "https://www.ovh.com/asia/vps/",
                AU: "https://www.ovh.com.au/vps/",
                CA: "https://www.ovh.com/ca/en/vps/",
                QC: "https://www.ovh.com/ca/fr/vps/",
                SG: "https://www.ovh.com/sg/vps/",
                WE: "https://www.ovh.com/us/vps/",
                WS: "https://www.ovh.com/us/es/vps/"
            },
            dedicated_server: {
                ASIA: "https://www.ovh.com/asia/dedicated-servers/",
                AU: "https://www.ovh.com.au/dedicated-servers/",
                CA: "https://www.ovh.com/ca/en/dedicated-servers/",
                QC: "https://www.ovh.com/ca/fr/serveurs-dedies/",
                SG: "https://www.ovh.com/sg/dedicated-servers/",
                WE: "https://www.ovh.com/us/dedicated-servers/",
                WS: "https://www.ovh.com/us/es/servidores-dedicados/"
            },
            dedicated_cloud: {
                ASIA: "https://www.ovh.com/asia/private-cloud/",
                AU: "https://www.ovh.com.au/private-cloud/",
                CA: "https://www.ovh.com/ca/en/dedicated-cloud/",
                QC: "https://www.ovh.com/ca/fr/cloud-dedie/",
                SG: "https://www.ovh.com/sg/private-cloud/",
                WE: "https://www.ovh.com/us/dedicated-cloud/",
                WS: "https://www.ovh.com/us/es/dedicated-cloud/"
            },
            load_balancer: {
                ASIA: "https://www.ovh.com/asia/solutions/ip-load-balancing/",
                AU: "https://www.ovh.com.au/solutions/ip-load-balancing/",
                CA: "https://www.ovh.com/ca/en/solutions/ip-load-balancing/",
                QC: "https://www.ovh.com/ca/fr/solutions/ip-load-balancing/",
                SG: "https://www.ovh.com/sg/solutions/ip-load-balancing/",
                WE: "https://www.ovh.com/us/solutions/ip-load-balancing/",
                WS: "https://www.ovh.com/us/es/soluciones/ip-load-balancing/"
            },
            vrack: {
                ASIA: "https://ca.ovh.com/asia/order/express/#/new/express/resume?products=~(~(planCode~'vrack~quantity~1~productId~'vrack))",
                AU: "https://ca.ovh.com/au/order/express/#/new/express/resume?products=~(~(planCode~'vrack~quantity~1~productId~'vrack))",
                CA: "https://ca.ovh.com/en/order/express/#/new/express/resume?products=~(~(planCode~'vrack~quantity~1~productId~'vrack))",
                QC: "https://ca.ovh.com/fr/order/express/#/new/express/resume?products=~(~(planCode~'vrack~quantity~1~productId~'vrack))",
                SG: "https://ca.ovh.com/sg/order/express/#/new/express/resume?products=~(~(planCode~'vrack~quantity~1~productId~'vrack))",
                WE: "https://us.ovh.com/us/order/express/#/new/express/resume?products=~(~(planCode~'vrack~quantity~1~productId~'vrack))",
                WS: "https://us.ovh.com/es/order/express/#/new/express/resume?products=~(~(planCode~'vrack~quantity~1~productId~'vrack))"
            },
            pcs: {
                ASIA: "https://www.ovh.com/asia/public-cloud/storage/object-storage/",
                AU: "https://www.ovh.com.au/public-cloud/storage/object-storage/",
                CA: "https://www.ovh.com/ca/en/public-cloud/storage/object-storage/",
                QC: "https://www.ovh.com/ca/fr/cloud-public/storage/object-storage/",
                SG: "https://www.ovh.com/sg/public-cloud/storage/object-storage/",
                WE: "https://www.ovh.com/us/public-cloud/storage/object-storage/",
                WS: "https://www.ovh.com/us/es/public-cloud/storage/object-storage/"
            },
            pca: {
                ASIA: "https://www.ovh.com/asia/public-cloud/storage/cloud-archive/",
                AU: "https://www.ovh.com.au/public-cloud/storage/cloud-archive/",
                CA: "https://www.ovh.com/ca/en/public-cloud/storage/cloud-archive/",
                QC: "https://www.ovh.com/ca/fr/cloud-public/storage/cloud-archive/",
                SG: "https://www.ovh.com/sg/public-cloud/storage/cloud-archive/",
                WE: "https://www.ovh.com/us/public-cloud/storage/cloud-archive/",
                WS: "https://www.ovh.com/us/es/public-cloud/storage/cloud-archive/"
            },
            veeam: {

            },
            cloud_disk_array: {
            },
            cloud_desktop: {
            },
            dbaas_logs: {
                CA: "https://ca.ovh.com/en/order/express/#/new/express/resume?products=~(~(planCode~'logs-basic~productId~'logs))",
                QC: "https://ca.ovh.com/fr/order/express/#/new/express/resume?products=~(~(planCode~'logs-basic~productId~'logs))",
                WE: "https://us.ovh.com/us/order/express/#/new/express/resume?products=~(~(planCode~'logs-basic~productId~'logs))",
                WS: "https://us.ovh.com/es/order/express/#/new/express/resume?products=~(~(planCode~'logs-basic~productId~'logs))"
            }
        },
        guides: {
            home: {
                ASIA: "http://docs.ovh.ca/en/",
                AU: "http://docs.ovh.ca/en/",
                CA: "http://docs.ovh.ca/en/",
                QC: "http://docs.ovh.ca/fr/",
                SG: "http://docs.ovh.ca/en/",
                WE: "http://docs.ovh.ca/en/",
                WS: "http://docs.ovh.ca/en/"
            },
            cda: {
                ASIA: "https://docs.ovh.com/gb/en/cloud/ceph/",
                AU: "https://docs.ovh.com/gb/en/cloud/ceph/",
                CA: "https://docs.ovh.com/gb/en/cloud/ceph/",
                QC: "https://docs.ovh.com/gb/en/cloud/ceph/",
                SG: "https://docs.ovh.com/gb/en/cloud/ceph/",
                WE: "https://docs.ovh.com/gb/en/cloud/ceph/",
                WS: "https://docs.ovh.com/gb/en/cloud/ceph/"
            },
            ip_failover: {
                ASIA: {
                    debian: "https://www.ovh.com/ca/en/g2042.ip_fail_over_debian",
                    ubuntu: "https://www.ovh.com/ca/en/g2043.ip_fail_over_ubuntu",
                    centos: "https://www.ovh.com/ca/en/g2044.ip_fail_over_centos",
                    fedora: "https://www.ovh.com/ca/en/g2045.ip_fail_over_fedora",
                    windows: "https://www.ovh.com/ca/en/g2046.ip_fail_over_windows"
                },
                AU: {
                    debian: "https://www.ovh.com/ca/en/g2042.ip_fail_over_debian",
                    ubuntu: "https://www.ovh.com/ca/en/g2043.ip_fail_over_ubuntu",
                    centos: "https://www.ovh.com/ca/en/g2044.ip_fail_over_centos",
                    fedora: "https://www.ovh.com/ca/en/g2045.ip_fail_over_fedora",
                    windows: "https://www.ovh.com/ca/en/g2046.ip_fail_over_windows"
                },
                CA: {
                    debian: "https://www.ovh.com/ca/en/g2042.ip_fail_over_debian",
                    ubuntu: "https://www.ovh.com/ca/en/g2043.ip_fail_over_ubuntu",
                    centos: "https://www.ovh.com/ca/en/g2044.ip_fail_over_centos",
                    fedora: "https://www.ovh.com/ca/en/g2045.ip_fail_over_fedora",
                    windows: "https://www.ovh.com/ca/en/g2046.ip_fail_over_windows"
                },
                QC: {
                    debian: "https://www.ovh.com/ca/fr/g2042.configurer_une_ip_fail_over_sur_debian",
                    ubuntu: "https://www.ovh.com/ca/fr/g2043.configurer_une_ip_fail_over_sur_ubuntu",
                    centos: "https://www.ovh.com/ca/fr/g2044.configurer_une_ip_fail_over_sur_centos",
                    fedora: "https://www.ovh.com/ca/fr/g2045.configurer_une_ip_fail_over_sur_fedora",
                    windows: "https://www.ovh.com/ca/fr/g2046.configurer_une_ip_fail_over_sur_windows"
                },
                SG: {
                    debian: "https://www.ovh.com/ca/en/g2042.ip_fail_over_debian",
                    ubuntu: "https://www.ovh.com/ca/en/g2043.ip_fail_over_ubuntu",
                    centos: "https://www.ovh.com/ca/en/g2044.ip_fail_over_centos",
                    fedora: "https://www.ovh.com/ca/en/g2045.ip_fail_over_fedora",
                    windows: "https://www.ovh.com/ca/en/g2046.ip_fail_over_windows"
                },
                WE: {
                    debian: "https://www.ovh.com/ca/en/g2042.ip_fail_over_debian",
                    ubuntu: "https://www.ovh.com/ca/en/g2043.ip_fail_over_ubuntu",
                    centos: "https://www.ovh.com/ca/en/g2044.ip_fail_over_centos",
                    fedora: "https://www.ovh.com/ca/en/g2045.ip_fail_over_fedora",
                    windows: "https://www.ovh.com/ca/en/g2046.ip_fail_over_windows"
                },
                WS: {
                    debian: "https://www.ovh.com/ca/en/g2042.ip_fail_over_debian",
                    ubuntu: "https://www.ovh.com/ca/en/g2043.ip_fail_over_ubuntu",
                    centos: "https://www.ovh.com/ca/en/g2044.ip_fail_over_centos",
                    fedora: "https://www.ovh.com/ca/en/g2045.ip_fail_over_fedora",
                    windows: "https://www.ovh.com/ca/en/g2046.ip_fail_over_windows"
                },
                defaultDistribution: "debian"
            },
            openstack: {
                FR: "https://www.ovh.com/fr/publiccloud/guides/g1852.charger_les_variables_denvironnement_openstack"
            },
            xauthtoken: {
                FR: "https://www.ovh.com/fr/publiccloud/guides/g1872.gestion_des_tokens"
            },
            vmResize: {
                FR: "https://www.ovh.com/fr/publiccloud/guides/g1778.redimensionner_une_instance#redimensionner_une_instance_redimensionnement_du_disque_sous_windows"
            },
            cloud: {
                FR: "https://docs.ovh.com/fr/fr/cloud/",
                IT: "https://www.ovh.it/g1785.cloud",
                ES: "https://www.ovh.es/g1785.cloud",
                PL: "https://www.ovh.pl/g1785.cloud"
            },
            vlans: {
                FR: {
                    roadmap: "https://www.ovh.com/fr/g2148.public_cloud_et_vrack_-_explications_et_roadmap",
                    api: "https://www.ovh.com/fr/publiccloud/guides/g2162.public_cloud_et_vrack_-_comment_utiliser_le_vrack_et_les_reseaux_prives_avec_les_instances_public_cloud"
                }
            },
            vrack: {
                FR: {
                    roadmap: "https://www.ovh.com/fr/g2148.public_cloud_et_vrack_-_explications_et_roadmap"
                }
            },
            rCloneFile: {
                AU: "https://docs.ovh.com/au/en/storage/sync-rclone-object-storage/",
                QC: "https://docs.ovh.com/ca/fr/storage/sync-rclone-object-storage/",
                CA: "https://docs.ovh.com/ca/en/storage/sync-rclone-object-storage/"
            }
        }
    });
