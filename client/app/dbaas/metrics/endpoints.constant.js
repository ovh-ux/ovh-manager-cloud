angular
    .module("managerApp")
    .constant("METRICS_ENDPOINTS", {
        protos: [
        // 'prometheus',
        // 'influxdb',
            "warp10",
            "opentsdb"
        ],
        suffix: "metrics.ovh.net"
    });
