angular.module("managerApp").constant("LogsHomeConstant", {
    URLS: {
        GRAYLOG_WEBUI: "GRAYLOG_WEBUI",
        GRAYLOG_API: "GRAYLOG_API",
        ELASTICSEARCH_API: "ELASTICSEARCH_API"
    },
    PORT_TYPES: {
        TCP_TLS: "TCP/TLS",
        TCP: "TCP",
        UDP: "UDP"
    },
    MESSAGE_TYPES: {
        GELF: "Gelf",
        RFC5424: "Syslog RFC5424",
        LTSV_LINE: "LTSV line",
        LTSV_NUL: "LTSV nul",
        CAP_N_PROTO: "Cap’n’Proto"
    },
    URL_TYPES: {
        TCP_TLS_GELF: {
            PORT: "TCP_TLS",
            MESSAGE: "GELF"
        },
        TCP_GELF: {
            PORT: "TCP",
            MESSAGE: "GELF"
        },
        UDP_GELF: {
            PORT: "UDP",
            MESSAGE: "GELF"
        },
        TCP_TLS_RFC5424: {
            PORT: "TCP_TLS",
            MESSAGE: "RFC5424"
        },
        TCP_RFC5424: {
            PORT: "TCP",
            MESSAGE: "RFC5424"
        },
        UDP_RFC5424: {
            PORT: "UDP",
            MESSAGE: "RFC5424"
        },
        TCP_TLS_LTSV_LINE: {
            PORT: "TCP_TLS",
            MESSAGE: "LTSV_LINE"
        },
        TCP_LTSV_LINE: {
            PORT: "TCP",
            MESSAGE: "LTSV_LINE"
        },
        UDP_LTSV_LINE: {
            PORT: "UDP",
            MESSAGE: "LTSV_LINE"
        },
        TCP_TLS_LTSV_NUL: {
            PORT: "TCP_TLS",
            MESSAGE: "LTSV_NUL"
        },
        TCP_LTSV_NUL: {
            PORT: "TCP",
            MESSAGE: "LTSV_NUL"
        },
        UDP_LTSV_NUL: {
            PORT: "UDP",
            MESSAGE: "LTSV_NUL"
        },
        TCP_TLS_CAP_N_PROTO: {
            PORT: "TCP_TLS",
            MESSAGE: "CAP_N_PROTO"
        },
        TCP_CAP_N_PROTO: {
            PORT: "TCP",
            MESSAGE: "CAP_N_PROTO"
        },
        UDP_CAP_N_PROTO: {
            PORT: "UDP",
            MESSAGE: "CAP_N_PROTO"
        }
    },
    PASSWORD_SPECIAL_CHARACTERS: "!\"#$%&'()*+,-./:;<=>?@[]^_`{|}~",
    SERVICE_STATE_TO_CONFIG: "TO_CONFIG",
    SERVICE_STATE_DISABLED: "DISABLED",
    DATA_STORAGE: {
        TIME_PERIOD_MONTHS: 3,
        METRICS: {
            SUM: "ldp.service.consumption.sum",
            COUNT: "ldp.service.consumption.count",
            COLD_STORAGE_TOTAL: "ldp.service.coldstorage.total"
        },
        AGGREGATORS: {
            MAX: "max"
        },
        DOWNSAMPLING_MODE: {
            "24H_MAX": "24h-max-none"
        }
    },
    DATA_USAGE_GRAPH_CONFIGURATION: {
        options: {
            scales: {
                xAxes: [{
                    gridLines: {
                        display: false
                    }
                }],
                yAxes: [
                    {
                        id: "y-axis-1",
                        type: "linear",
                        display: true,
                        position: "left"
                    },
                    {
                        id: "y-axis-2",
                        type: "linear",
                        display: true,
                        position: "right",
                        gridLines: {
                            display: false
                        }
                    }
                ]
            },
            legend: {
                display: true,
                position: "bottom",
                labels: {
                    fontStyle: "bold"
                }
            },
            tooltips: {
                backgroundColor: "rgba(256,256,256,0.8)",
                titleFontColor: "#113f6d",
                bodyFontColor: "#113f6d",
                borderColor: "#bbbdbf",
                borderWidth: 1
            }
        },
        colors: [
            {
                backgroundColor: "rgba(89,210,239, 0.4)",
                pointBackgroundColor: "transparent",
                pointHoverBackgroundColor: "#59d2ef",
                borderColor: "#59d2ef",
                pointBorderColor: "transparent",
                pointHoverBorderColor: "#fff"
            }, {
                backgroundColor: "transparent",
                pointBackgroundColor: "transparent",
                pointHoverBackgroundColor: "#113f6d",
                borderColor: "#113f6d",
                pointBorderColor: "transparent",
                pointHoverBorderColor: "#fff"
            }
        ],
        datasetOverride: [{ yAxisID: "y-axis-1" }, { yAxisID: "y-axis-2" }]
    }
});
