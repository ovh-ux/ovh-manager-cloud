"use strict";

angular.module("managerApp")
.constant("TARGET", "US")
.constant("UNIVERSE", "CLOUD")
.constant("MANAGER_URLS", {
    "dedicated" : "https://www.ovh.us/manager/dedicated/index.html#/",
    "cloud"     : "https://www.ovh.us/manager/cloud/index.html#/",
    "sunrise"   : "https://www.ovh.us/manager/sunrise/index.html#/",
    "portal"    : "https://www.ovh.com/manager/portal/index.html#/"
})
.constant("REDIRECT_URLS", {
    "support"              : "https://www.ovh.us/manager/dedicated/index.html#/ticket",
    "billing"              : "https://www.ovh.us/manager/dedicated/index.html#/billing/history",
    "ordersInProgress"     : "https://www.ovh.us/manager/dedicated/index.html#/billing/orders?status=in-progress",
    "orders"               : "https://www.ovh.us/manager/dedicated/index.html#/billing/orders?status=all",
    "orderSql"             : "https://www.ovh.com/manager/web/#/configuration/sql_order?orderType=dbaas",
    "services"             : "https://www.ovh.us/manager/dedicated/index.html#/billing/autoRenew",
    "paymentMeans"         : "https://www.ovh.us/manager/dedicated/index.html#/billing/mean",
    "addCreditCard"        : "https://www.ovh.us/manager/dedicated/index.html#/billing/mean/add?meanType=creditCard",
    "ovhAccount"           : "https://www.ovh.us/manager/dedicated/index.html#/billing/ovhaccount",
    "debtAccount"          : "https://www.ovh.us/manager/dedicated/index.html#/billing/statements",
    "userInfos"            : "https://www.ovh.us/manager/dedicated/index.html#/useraccount/infos",
    "contacts"             : null, // not yet available to US users
    "horizon"              : "https://horizon.cloud.ovh.net/openstackdashboard?username={username}",
    "ipAction"             : "https://www.ovh.us/manager/dedicated/index.html#/configuration/ip?action={action}&ip={ip}&ipBlock={ipBlock}",
    "vRack"                : "https://www.ovh.us/manager/dedicated/index.html#/configuration/vrack?landingTo=networks",
    "nas"                  : "https://www.ovh.us/manager/dedicated/index.html#/configuration/nas?landingTo=networks",
    "nasPage"              : "https://www.ovh.us/manager/dedicated/index.html#/configuration/nas/nas/nas_{nas}?landingTo=networks",
    "ip"                   : "https://www.ovh.us/manager/dedicated/index.html#/configuration/ip?landingTo=ip",
    "license"              : "https://www.ovh.us/manager/dedicated/index.html#/configuration/license?landingTo=licences",
    "housing"              : "https://www.ovh.com/manager/dedicated/index.html#/configuration/housing/{housing}?landingTo=dedicatedServers",
    "dedicatedServers"     : "https://www.ovh.us/manager/dedicated/index.html#/configuration?landingTo=dedicatedServers",
    "dedicatedServersPage" : "https://www.ovh.us/manager/dedicated/index.html#/configuration/server/{server}?landingTo=dedicatedServers",
    "dedicatedCloud"       : "https://www.ovh.us/manager/dedicated/index.html#/configuration?landingTo=dedicatedClouds",
    "dedicatedCloudPage"   : "https://www.ovh.us/manager/dedicated/index.html#/configuration/dedicated_cloud/{pcc}?landingTo=dedicatedClouds",
    "cloudDesktop"         : null, // not yet available to US users
    "vps"                  : "https://www.ovh.us/manager/dedicated/index.html#/configuration?landingTo=vps",
    "vpsPage"              : "https://www.ovh.us/manager/dedicated/index.html#/configuration/vps/{vps}?landingTo=vps",
    "networks"             : "https://www.ovh.us/manager/dedicated/index.html#/configuration?landingTo=networks",
    "cdnPage"              : "https://www.ovh.us/manager/dedicated/index.html#/configuration/cdn/{cdn}?landingTo=networks",
    "renew"                : "https://www.ovh.us/cgi-bin/order/renew.cgi?domainChooser={serviceName}"
})
// CA eq to en_CA
// QC eq to fr_CA
// WS eq to es_US
// AU eq to en_CA
.constant("URLS", {
    "support": {
        US: "http://www.ovh.us/support/"
    },
    "support_contact": {
        US: "https://www.ovh.us/us/support/"
    },
    "website_order": {
        "cloud-resell-eu": {
            US: (projectName) =>
                "https://www.ovh.us/order/express/#/new/express/resume?products=~(~(planCode~'project-eu~productId~'cloud~quantity~1~duration~'P1M~configuration~(~(label~'description~values~(~'"+encodeURIComponent(projectName)+")))))",
        },
        "dedicated_server": {
            US: "https://www.ovh.us/dedicated-servers/"
        },
        "dedicated_cloud": {
            US: "https://www.ovh.us/dedicated-cloud/"
        },
        "load_balancer": {
            US: "https://www.ovh.us/solutions/ip-load-balancing/"
        },
        pcs: {
            US: "https://www.ovh.us/public-cloud/storage/object-storage/"
        },
        pca: {
            US: "https://www.ovh.us/public-cloud/storage/cloud-archive/"
        },
        cloud_disk_array: {
            US: "https://www.ovh.us/cloud/cloud-disk-array/"
        },
        veeam: {
        }
    },
    "guides": {
        "home": {
            US: "http://docs.ovh.us"
        },
        cda: {

        },
        "ip_failover": {
            US: {
                "debian": "https://www.ovh.com/ca/en/g2042.ip_fail_over_debian",
                "ubuntu": "https://www.ovh.com/ca/en/g2043.ip_fail_over_ubuntu",
                "centos": "https://www.ovh.com/ca/en/g2044.ip_fail_over_centos",
                "fedora": "https://www.ovh.com/ca/en/g2045.ip_fail_over_fedora",
                "windows": "https://www.ovh.com/ca/en/g2046.ip_fail_over_windows"
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
            US: "https://docs.ovh.us/cloud/"
        },
        vlans: {
        },
        vrack: {
        },
        ssh: {
            create: {
                US: "https://www.ovh.us/g1769.creating_ssh_keys"
            },
            add: {
                US: "https://www.ovh.us/g1924.configuring_additionnal_ssh_key"
            },
            change: {
                US: "https://www.ovh.us/g2069.replacing_your_lost_ssh_key_pair",
            }
        }
    }
});
