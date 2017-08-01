angular.module("managerApp").constant("IpLoadBalancerConstant", {
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
    ]
});
