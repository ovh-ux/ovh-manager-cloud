angular.module("managerApp")
    .constant("METRICS_ENDPOINTS", {
        graphs: [
            {
                name: "Quantum",
                url: "https://quantum.metrics.ovh.net"
            },
            {
                name: "Grafana",
                url: "https://grafana.tsaas.ovh.com"
            }
        ],
        protos: [
        // 'prometheus',
        // 'influxdb',
            "warp10",
            "opentsdb"
        ],
        suffix: "metrics.ovh.net"
    });
