angular.module("managerApp").constant("IpLoadBalancerConstant", {
    metricsUrl: "https://opentsdb-in.gra1-ovh.metrics.ovh.net/api",
    graphs: [
        "conn",
        "reqm"
    ],
    graphParams: {
        "1h-ago": {
            downsample: "1m"
        },
        "3h-ago": {
            downsample: "1m"
        },
        "6h-ago": {
            downsample: "5m"
        },
        "12h-ago": {
            downsample: "10m"
        },
        "1d-ago": {
            downsample: "30m"
        },
        "2d-ago": {
            downsample: "1h"
        },
        "3d-ago": {
            downsample: "2h"
        }
    },
    protocols: [
        "http",
        "https",
        "tcp",
        "tls",
        "udp"
    ],
    balances: [
        "roundrobin",
        "first",
        "leastconn",
        "source",
        "uri"
    ],
    stickinesses: [
        "cookie",
        "sourceIp"
    ],
    probeTypes: [
        "",
        "http",
        "mysql",
        "pgsql",
        "smtp",
        "tcp",
        "oco"
    ],
    probeMethods: [
        "GET",
        "HEAD",
        "OPTIONS"
    ],
    probeMatches: [
        "default",
        "status",
        "contains",
        "matches"
    ],
    portLimit: 65535,
    lbWeightMax: 256,
    sslTypes: [
        "free",
        "dv",
        "ev"
    ],
    organisationTypes: [
        "Private Organisation",
        "Government Entity",
        "Business Entity"
    ],
    sslOrders: {
        comodoEv: {
            planCode: "sslgateway-advanced",
            duration: "P1M",
            configuration: {},
            option: [{
                planCode: "sslgateway-ssl-ev-single",
                configuration: {},
                duration: "P1Y",
                quantity: 1
            }],
            quantity: 1,
            productId: "sslGateway"
        },
        comodoDv: {
            planCode: "sslgateway-advanced",
            duration: "P1M",
            configuration: {},
            option: [],
            quantity: 1,
            productId: "sslGateway"
        },
        free: {
            planCode: "sslgateway-free",
            duration: "P1M",
            configuration: {},
            option: [],
            quantity: 1,
            productId: "sslGateway"
        }
    }
});
