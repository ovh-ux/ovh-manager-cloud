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
    portLimit: 65535
});
