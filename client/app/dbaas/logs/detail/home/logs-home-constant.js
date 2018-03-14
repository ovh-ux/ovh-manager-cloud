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
    ADD_CONTACT_URL: "https://www.ovh.com/manager/web/index.html#/useraccount/subContacts/add?returnUrl="
});
