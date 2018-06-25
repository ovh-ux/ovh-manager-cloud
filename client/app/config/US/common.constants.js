"use strict";

angular.module("managerApp")
    .constant("TARGET", "US")
    .constant("UNIVERSE", "CLOUD")
    .constant("MANAGER_URLS", {
        dedicated: "https://ovhcloud.com/manager/dedicated/index.html#/",
        cloud: "https://ovhcloud.com/manager/cloud/index.html#/",
        sunrise: "https://ovhcloud.com/manager/sunrise/index.html#/",
        gamma: "https://ca.ovh.com/manager/sunrise/index.html#/",
        portal: "https://www.ovh.com/manager/portal/index.html#/"
    })
    .constant("REDIRECT_URLS", {
        support: "https://ovhcloud.com/manager/dedicated/index.html#/ticket",
        billing: "https://ovhcloud.com/manager/dedicated/index.html#/billing/history",
        billingPayments: "https://ovhcloud.com/manager/dedicated/index.html#/billing/payments",
        billingMean: "https://ovhcloud.com/manager/dedicated/index.html#/billing/mean",
        billingVouchers: "https://ovhcloud.com/manager/dedicated/index.html#/billing/vouchers",
        billingRefunds: "https://ovhcloud.com/manager/dedicated/index.html#/billing/refunds",
        billingFidelity: "https://ovhcloud.com/manager/dedicated/index.html#/billing/fidelity",
        billingCredits: "https://ovhcloud.com/manager/dedicated/index.html#/billing/credits",
        ordersInProgress: "https://ovhcloud.com/manager/dedicated/index.html#/billing/orders?status=in-progress",
        orders: "https://ovhcloud.com/manager/dedicated/index.html#/billing/orders?status=all",
        services: "https://ovhcloud.com/manager/dedicated/index.html#/billing/autoRenew",
        servicesAgreements: "https://ovhcloud.com/manager/dedicated/index.html#/useraccount/agreements",
        paymentMeans: "https://ovhcloud.com/manager/dedicated/index.html#/billing/mean",
        addCreditCard: "https://ovhcloud.com/manager/dedicated/index.html#/billing/mean/add?meanType=creditCard",
        ovhAccount: "https://ovhcloud.com/manager/dedicated/index.html#/billing/ovhaccount",
        debtAccount: "https://ovhcloud.com/manager/dedicated/index.html#/billing/statements",
        userInfos: "https://ovhcloud.com/manager/dedicated/index.html#/useraccount/infos",
        userSecurity: "https://ovhcloud.com/manager/dedicated/index.html#/useraccount/security",
        userEmails: "https://ovhcloud.com/manager/dedicated/index.html#/useraccount/emails",
        userSubscriptions: "https://ovhcloud.com/manager/dedicated/index.html#/useraccount/subscriptions",
        userSSH: "https://ovhcloud.com/manager/dedicated/index.html#/useraccount/ssh",
        userAdvanced: "https://ovhcloud.com/manager/dedicated/index.html#/useraccount/advanced",
        contacts: null, // not yet available to US users
        horizon: "https://horizon.cloud.ovh.net/openstackdashboard?username={username}",
        ipAction: "https://ovhcloud.com/manager/dedicated/index.html#/configuration/ip?action={action}&ip={ip}&ipBlock={ipBlock}",
        vRack: "https://ovhcloud.com/manager/dedicated/index.html#/configuration/vrack?landingTo=networks",
        nas: "https://ovhcloud.com/manager/dedicated/index.html#/configuration/nas?landingTo=networks",
        nasPage: "https://ovhcloud.com/manager/dedicated/index.html#/configuration/nas/nas/nas_{nas}?landingTo=networks",
        ip: "https://ovhcloud.com/manager/dedicated/index.html#/configuration/ip?landingTo=ip",
        license: "https://ovhcloud.com/manager/dedicated/index.html#/configuration/license?landingTo=licences",
        housing: "https://www.ovh.com/manager/dedicated/index.html#/configuration/housing/{housing}?landingTo=dedicatedServers",
        dedicatedServers: "https://ovhcloud.com/manager/dedicated/index.html#/configuration?landingTo=dedicatedServers",
        dedicatedServersPage: "https://ovhcloud.com/manager/dedicated/index.html#/configuration/server/{server}?landingTo=dedicatedServers",
        dedicatedCloud: "https://ovhcloud.com/manager/dedicated/index.html#/configuration?landingTo=dedicatedClouds",
        dedicatedCloudPage: "https://ovhcloud.com/manager/dedicated/index.html#/configuration/dedicated_cloud/{pcc}?landingTo=dedicatedClouds",
        cloudDesktop: null, // not yet available to US users
        vps: "https://ovhcloud.com/manager/dedicated/index.html#/configuration?landingTo=vps",
        vpsPage: "https://ovhcloud.com/manager/dedicated/index.html#/configuration/vps/{vps}?landingTo=vps",
        networks: "https://ovhcloud.com/manager/dedicated/index.html#/configuration?landingTo=networks",
        cdnPage: "https://ovhcloud.com/manager/dedicated/index.html#/configuration/cdn/{cdn}?landingTo=networks",
        renew: "https://ovhcloud.com/cgi-bin/order/renew.cgi?domainChooser={serviceName}"
    })
    .constant("DOCS_ALL_GUIDES", {
        US: "https://support.ovhcloud.com/hc/en-us"
    })
    .constant("DOCS_HOMEPAGE_GUIDES", {
        DEFAULT: {
            PROJECT: {
                title: "homepage_type_of_guide_pci",
                list: [{
                    text: "guide_project_all",
                    atInternetClickTag: "TopGuide-PublicCloud-all",
                    isExternal: true,
                    href: "https://support.ovhcloud.com/hc/en-us"
                }]
            }
        }
    })
// CA eq to en_CA
// QC eq to fr_CA
// WS eq to es_US
// AU eq to en_CA
    .constant("URLS", {
        support: {
            US: "http://ovhcloud.com/support/"
        },
        support_contact: {
            US: "https://ovhcloud.com/us/support/"
        },
        website_order: {
            "cloud-resell-eu": {
                US: projectName =>
                    `https://ovhcloud.com/order/express/#/express/review?products=~(~(planCode~'project-eu~productId~'cloud~quantity~1~duration~'P1M~configuration~(~(label~'description~values~(~'${encodeURIComponent(projectName)})))))`
            },
            dedicated_server: {
                US: "https://ovhcloud.com/order/dedicated/#/dedicated/select"
            },
            dedicated_cloud: {
                US: "https://ovhcloud.com/dedicated-cloud/"
            },
            load_balancer: {
                US: "https://ovhcloud.com/solutions/ip-load-balancing/"
            },
            pcs: {
                US: "https://ovhcloud.com/public-cloud/storage/object-storage/"
            },
            pca: {
                US: "https://ovhcloud.com/public-cloud/storage/cloud-archive/"
            },
            vrack: {
                US: "https://ovhcloud.com/order/express/#/express/review?products=~(~(planCode~'vrack~quantity~1~productId~'vrack))"
            },
            cloud_disk_array: {
                US: "https://ovhcloud.com/cloud/cloud-disk-array/"
            },
            veeam: {
            },
            cloud_desktop: {
            },
            dbaas_logs: {
            }
        },
        guides: {
            home: {
                US: "http://docs.ovhcloud.com"
            },
            cda: {

            },
            ip_failover: {
                US: {
                    debian: "https://www.ovh.com/ca/en/g2042.ip_fail_over_debian",
                    ubuntu: "https://www.ovh.com/ca/en/g2043.ip_fail_over_ubuntu",
                    centos: "https://www.ovh.com/ca/en/g2044.ip_fail_over_centos",
                    fedora: "https://www.ovh.com/ca/en/g2045.ip_fail_over_fedora",
                    windows: "https://www.ovh.com/ca/en/g2046.ip_fail_over_windows"
                },
                defaultDistribution: "debian"
            },
            openstack: {
            },
            xauthtoken: {
            },
            vmResize: {
            },
            cloud: {
                US: "https://docs.ovhcloud.com/cloud/"
            },
            vlans: {
            },
            vrack: {
            },
            rCloneFile: {
            },
            ssh: {
                create: {
                    US: "https://ovhcloud.com/g1769.creating_ssh_keys"
                },
                add: {
                    US: "https://ovhcloud.com/g1924.configuring_additionnal_ssh_key"
                },
                change: {
                    US: "https://ovhcloud.com/g2069.replacing_your_lost_ssh_key_pair"
                }
            }
        }
    });
