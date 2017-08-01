angular
    .module("managerApp")
    .constant("METRICS_PLANS", {
        cloud: {
            "metrics-free-trial": {
                level: 0,
                title: "",
                mads: 10,
                show: false
            },
            "metrics-cloud-xxs": {
                level: 1,
                mads: 100,
                title: "XXS"
            },
            "metrics-cloud-xs": {
                level: 2,
                mads: 1000,
                title: "XS"
            },
            "metrics-cloud-s": {
                level: 3,
                mads: 3000,
                title: "S"
            },
            "metrics-cloud-m": {
                level: 4,
                mads: 10000,
                title: "M"
            },
            "metrics-cloud-l": {
                level: 5,
                mads: 100000,
                title: "L"
            },
            "metrics-cloud-xl": {
                level: 6,
                mads: 1000000,
                title: "XL"
            }
        },
        live: {
            "metrics-live-64g": {
                level: 1,
                title: "64 Go"
            },
            "metrics-live-128g": {
                level: 2,
                title: "128 Go"
            },
            "metrics-live-256g": {
                level: 3,
                title: "256 Go"
            },
            "metrics-live-512g": {
                level: 4,
                title: "512 Go"
            },
            "metrics-live-1t": {
                level: 5,
                title: "1 To"
            },
            "metrics-live-2t": {
                level: 6,
                title: "2 To"
            }
        }
    });
