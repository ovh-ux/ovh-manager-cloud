angular.module("managerApp").constant("LogsConstants", {
    COLDSTORAGE: "COLDSTORAGE",
    DESCRIPTION_MIN_LENGTH: 3,
    EXPOSED_PORT_MIN: 514,
    EXPOSED_PORT_MAX: 65535,
    DISPLAY_NAME_MAX_LENGTH: 255,
    FAILURE: "FAILURE",
    SUCCESS: "SUCCESS",
    suffixPattern: "^[a-z0-9_-]+$",
    ORDER_URL: "/order/express/#/new/express/resume?products=~(~(planCode~'logs-basic~productId~'logs))",
    LOGS_DOCS_NAME: "logs-data-platform",
    LOGS_PRODUCT_URL: "/data-platforms/logs/",
    ELASTICSEARCH_API_URL: "ELASTICSEARCH_API",
    SERVICE_STATE_TO_CONFIG: "TO_CONFIG",
    SERVICE_STATE_DISABLED: "DISABLED",
    SERVICE_STATE_ENABLED: "ENABLED",
    PASSWORD_SPECIAL_CHARACTERS: "!\"#$%&'()*+,-./:;<=>?@[]^_`{|}~",
    MESSAGE_THRESHOLD: 1000,
    WEB_SOCKET_URL: "WEB_SOCKET",
    RFC_URL: "TCP_TLS_RFC5424",
    LTSV_URL: "TCP_TLS_LTSV_NUL",
    GELF_URL: "TCP_TLS_GELF",
    GELF: "GELF",
    LTSV: "LTSV",
    RFC5424: "RFC5424",
    GRAYLOG_WEBUI: "GRAYLOG_WEBUI",
    X_OVH_TOKEN: "X-OVH-TOKEN",
    GZIP: "GZIP",
    DEFLATED: "DEFLATED",
    LZMA: "LZMA",
    ZSTD: "ZSTD",
    TITLE_MIN_LENGTH: 3,
    TITLE_MAX_LENGTH: 255,
    FIELD_MIN_LENGTH: 3,
    FIELD_MAX_LENGTH: 50,
    VALUE_MIN_LENGTH: 3,
    VALUE_MAX_LENGTH: 50,
    TIME_PERIOD_MIN_IN_SECONDS: 1,
    TIME_PERIOD_MAX_IN_SECONDS: 3600,
    THRESHOLD_MIN: 0,
    THRESHOLD_MAX: 99,
    GRACE_PERIOD_MIN_IN_MINUTES: 1,
    GRACE_PERIOD_MAX_IN_MINUTES: 60,
    BACKLOG_MIN: 1,
    BACKLOG_MAX: 20,
    expirationInSeconds: 86400,
    indexStorage: {
        success: "success",
        error: "error",
        warning: "warning"
    },
    alertType: {
        counter: "MESSAGE_COUNT",
        numeric: "FIELD_VALUE",
        textual: "FIELD_CONTENT_VALUE"
    },
    thresholdType: {
        more: "MORE",
        less: "LESS",
        lower: "LOWER",
        higher: "HIGHER"
    },
    constraintType: {
        mean: "MEAN",
        min: "MIN",
        max: "MAX",
        sum: "SUM",
        sd: "STDDEV"
    },
    state: {
        SEALED: "sealed",
        UNSEALED: "unsealed",
        UNSEALING: "unsealing"
    },
    stateType: {
        sealed: "info",
        unsealed: "success",
        unsealing: "warning"
    },
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
    OFFER_STORAGE_MULTIPLIER: 1073741824,
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
                borderWidth: 1,
                position: "nearest"
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
            }, {
                backgroundColor: "transparent",
                pointBackgroundColor: "transparent",
                pointHoverBackgroundColor: "transparent",
                borderColor: "#ff9803",
                pointBorderColor: "transparent",
                pointHoverBorderColor: "transparent"
            }
        ],
        datasetOverride: [{ yAxisID: "y-axis-1" }, { yAxisID: "y-axis-2" }, { yAxisID: "y-axis-1" }]
    },
    inputStatus: {
        PROCESSING: "PROCESSING",
        INIT: "INIT",
        PENDING: "PENDING",
        RUNNING: "RUNNING"
    },
    inputState: {
        PROCESSING: "processing",
        RESTART_REQUIRED: "restart_required",
        TO_CONFIGURE: "to_configure",
        PENDING: "pending",
        RUNNING: "running",
        UNKNOWN: "unknown"
    },
    inputStateType: {
        processing: "info",
        restart_required: "info",
        to_configure: "warning",
        pending: "info",
        running: "success",
        unknown: "error"
    },
    INPUT_DEFAULT_PORT: 6514,
    basicOffer: "logs-basic",
    offertypes: {
        BASIC: "Basic",
        PRO: "Pro"
    },
    productName: "logs",
    ALIAS_OPTION_REFERENCE: "logs-alias",
    DASHBOARD_OPTION_REFERENCE: "logs-dashboard",
    INDEX_OPTION_REFERENCE: "logs-index",
    INPUT_OPTION_REFERENCE: "logs-input",
    ROLE_OPTION_REFERENCE: "logs-role",
    STREAM_OPTION_REFERENCE: "logs-stream",
    PRODUCT_COUNT: {
        "logs-input-2": 2,
        "logs-input-4": 4,
        "logs-input-8": 8,
        "logs-dashboard-5": 5,
        "logs-stream-5": 5,
        "logs-kibana-1": 1,
        "logs-alias-5": 5,
        "logs-index-1": 1,
        "logs-index-2": 1,
        "logs-index-4": 1,
        "logs-index-8": 1,
        "logs-index-16": 1
    },
    logstash: "LOGSTASH",
    flowgger: "FLOWGGER",
    patternRowFill: 5,
    logStashWizard:
    {
        Syslog: {
            name: "Syslog",
            input: "tcp {\n\tport => INPUT_PORT\n\ttype => syslog\n\tssl_enable => true\n\tssl_verify => false\n\tssl_cert => \"/etc/ssl/private/server.crt\"\n\tssl_key => \"/etc/ssl/private/server.key\"\n\tssl_extra_chain_certs => [\"/etc/ssl/private/ca.crt\"]\n}",
            filter: "grok {\n\tmatch => { \"message\" => \"%{SYSLOGBASE}\" }\n}\n\ndate {\n\tmatch => [ \"timestamp\", \"MMM dd HH:mm:ss\" ]\n\ttarget => \"timestamp\"\n\ttimezone => \"Europe/Paris\"\n}",
            patterns: "",
            documentation: "https://docs.ovh.com/gb/en/mobile-hosting/logs-data-platform/how-to-log-your-linux/"
        },
        Apache: {
            name: "Apache",
            input: "beats {\n\tport => INPUT_PORT\n\tssl => true\n\tssl_certificate => \"/etc/ssl/private/server.crt\"\n\tssl_key => \"/etc/ssl/private/server.key\"\n}",
            filter: "mutate {\n\trename => {\n\t\t\"source\" => \"filename\"\n\t}\n}\n\ngrok  {\n\tmatch => { \"message\" => \"%{OVHCOMMONAPACHELOG}\" }\n\tpatterns_dir => \"/opt/logstash/patterns\"\n}\n\nif (\"_grokparsefailure\" in [tags]) {\n\tmutate {\n\t\tremove_tag => [ \"_grokparsefailure\" ]\n\t}\n\tgrok {\n\t\tmatch => [ \"message\", \"%{OVHCOMBINEDAPACHELOG}\" ]\n\t\tpatterns_dir => \"/opt/logstash/patterns\"\n\t\tnamed_captures_only => true\n\t}\n}",
            patterns: "OVHCOMMONAPACHELOG %{IPORHOST:clientip} %{USER:ident} %{USER:auth} \\[%{HTTPDATE:timestamp}\\] \"(?:%{WORD:verb} %{NOTSPACE:request}(?: HTTP/%{NUMBER:httpversion_num:float})?|%{DATA:rawrequest})\" %{NUMBER:response_int:int} (?:%{NUMBER:bytes_int:int}|-)\nOVHCOMBINEDAPACHELOG %{OVHCOMMONAPACHELOG} %{QS:referrer} %{QS:agent}",
            documentation: "https://docs.ovh.com/gb/en/mobile-hosting/logs-data-platform/filebeat-logs/"
        },
        HAProxy: {
            name: "HAProxy",
            input: "tcp {\n\tport => INPUT_PORT\n\ttype => haproxy\n\tssl_enable => true\n\tssl_verify => false\n\tssl_cacert => \"/etc/ssl/private/ca.crt\"\n\tssl_cert => \"/etc/ssl/private/server.crt\"\n\tssl_key => \"/etc/ssl/private/server.key\"\n}",
            filter: "if [type] == \"haproxy\" {\n\tgrok {\n\t\tmatch => [ \"message\", \"%{OVHHAPROXYHTTP}\" ]\n\t\tpatterns_dir => \"/opt/logstash/patterns\"\n\t\tnamed_captures_only => true\n\t}\n\tif (\"_grokparsefailure\" in [tags]) {\n\t\tmutate {\n\t\t\tremove_tag => [ \"_grokparsefailure\" ]\n\t\t}\n\t\tgrok {\n\t\t\tmatch => [ \"message\", \"%{OVHHAPROXYTCP}\" ]\n\t\t\tpatterns_dir => \"/opt/logstash/patterns\"\n\t\t\tnamed_captures_only => true\n\t\t}\n\t}\n\tif (\"_grokparsefailure\" in [tags]) {\n\t\tmutate {\n\t\t\tremove_tag => [ \"_grokparsefailure\" ]\n\t\t}\n\t\tgrok {\n\t\t\tmatch => [ \"message\", \"%{OVHHAPROXYERROR}\" ]\n\t\t\tpatterns_dir => \"/opt/logstash/patterns\"\n\t\t\tnamed_captures_only => true\n\t\t}\n\t}\n\tif !(\"_grokparsefailure\" in [tags]) {\n\t\tdate {\n\t\t\tlocale => \"en\"\n\t\t\tmatch => [ \"accept_date\", \"dd/MMM/YYYY:HH:mm:ss.SSS\", \"ISO8601\"]\n\t\t\ttimezone => \"Europe/Paris\"\n\t\t\ttarget => \"accept_date\"\n\t\t}\n\t\tdate {\n\t\t\tmatch => [ \"timestamp8601_date\", \"ISO8601\" ]\n\t\t\ttimezone => \"Europe/Paris\"\n\t\t\ttarget => \"@timestamp\"\n\t\t}\n\t}\n}",
            patterns: "OVHHAPROXYTIME (?!<[0-9])%{HOUR:haproxy_hour_int:int}:%{MINUTE:haproxy_minute_int:int}(?::%{SECOND:haproxy_second_int:int})(?![0-9])\nOVHHAPROXYDATE %{MONTHDAY:haproxy_monthday_int:int}/%{MONTH:haproxy_month}/%{YEAR:haproxy_year_int:int}:%{OVHHAPROXYTIME:haproxy_time}.%{INT:haproxy_milliseconds:int}\nOHVSYSLOGHEAD <%{NONNEGINT:facility:int}.%{NONNEGINT:severity:int}>\nOVHHAPROXYHEAD (?:%{SYSLOGTIMESTAMP:syslog_timestamp}|%{TIMESTAMP_ISO8601:timestamp8601_date}) %{IPORHOST:syslog_server} %{SYSLOGPROG}:\nOVHHAPROXYHTTPBASE %{IP:client_ip}:%{INT:client_port_int:int} \\[%{OVHHAPROXYDATE:accept_date}\\] %{NOTSPACE:frontend_name} %{NOTSPACE:backend_name}/%{NOTSPACE:server_name} %{INT:time_request_int:int}/%{INT:time_queue_int:int}/%{INT:time_backend_connect_int:int}/%{INT:time_backend_response_int:int}/%{NOTSPACE:time_duration_int:int} %{INT:http_status_code_int:int} %{NOTSPACE:bytes_read_int:int} %{DATA:captured_request_cookie} %{DATA:captured_response_cookie} %{NOTSPACE:termination_state} %{INT:actconn_int:int}/%{INT:feconn_int:int}/%{INT:beconn_int:int}/%{INT:srvconn_int:int}/%{NOTSPACE:retries_int:int} %{INT:srv_queue_int:int}/%{INT:backend_queue_int:int} (\\{%{HAPROXYCAPTUREDREQUESTHEADERS}\\})?( )?(\\{%{HAPROXYCAPTUREDRESPONSEHEADERS}\\})?( )?\"(<BADREQ>|(%{WORD:http_verb} (%{URIPROTO:http_proto}://)?(?:%{USER:http_user}(?::[^@]*)?@)?(?:%{URIHOST:http_host})?(?:%{URIPATHPARAM:http_request})?( HTTP/%{NUMBER:http_version})?))?\"\nOVHHAPROXYHTTP %{OVHHAPROXYHEAD} %{OVHHAPROXYHTTPBASE}\nOVHHAPROXYTCP %{OVHHAPROXYHEAD} %{IP:client_ip}:%{INT:client_port_int:int} \\[%{OVHHAPROXYDATE:accept_date}\\] %{NOTSPACE:frontend_name} %{NOTSPACE:backend_name}/%{NOTSPACE:server_name} %{INT:time_queue_int:int}/%{INT:time_backend_connect_int:int}/%{NOTSPACE:time_duration_int:int} %{NOTSPACE:bytes_read_int:int} %{NOTSPACE:termination_state} %{INT:actconn_int:int}/%{INT:feconn_int:int}/%{INT:beconn_int:int}/%{INT:srvconn_int:int}/%{NOTSPACE:retries_int:int} %{INT:srv_queue_int:int}/%{INT:backend_queue_int:int}\nOVHHAPROXYERROR %{OVHHAPROXYHEAD} %{IP:client_ip}:%{INT:client_port_int:int} \\[%{OVHHAPROXYDATE:accept_date}\\] %{NOTSPACE:frontend_name}/%{NOTSPACE:bind_name}: %{GREEDYDATA:error_message}",
            documentation: "https://docs.ovh.com/gb/en/mobile-hosting/logs-data-platform/haproxy/"
        },
        "MySQL Slow Queries": {
            name: "MySQL Slow Queries",
            input: "beats {\n\tport => INPUT_PORT\n\tssl => true\n\tssl_certificate => \"/etc/ssl/private/server.crt\"\n\tssl_key => \"/etc/ssl/private/server.key\"\n}",
            filter: "grok { \n\tmatch => [ \"message\", \"%{OVHMYSQLTIME}\" ] \n}\nif (\"_grokparsefailure\" in [tags]) {\n\tmutate {\n\t\tremove_tag => [ \"_grokparsefailure\" ]\n\t}\n} else {\n\tdrop { }\n}\n\ngrok { \n\tmatch => [ \"message\", \"%{OVHMYSQLHOST}\" ] \n}\nif (\"_grokparsefailure\" in [tags]) {\n\tmutate {\n\t\tremove_tag => [ \"_grokparsefailure\" ]\n\t}\n}\n\ngrok {\n\tmatch => [ \"message\", \"%{OVHMYSQLSTATS}\"]\n}\nif (\"_grokparsefailure\" in [tags]) {\n\tmutate {\n\t\tremove_tag => [ \"_grokparsefailure\" ]\n\t}\n}\n\ngrok {\n\tmatch => [ \"message\", \"%{OVHMYSQLBYTES}\"]\n}\nif (\"_grokparsefailure\" in [tags]) {\n\tmutate {\n\t\tremove_tag => [ \"_grokparsefailure\" ]\n\t}\n}\n\ngrok {\n\tmatch => [ \"message\", \"%{OVHMYSQLUSEDB}\"]\n}\nif (\"_grokparsefailure\" in [tags]) {\n\tmutate {\n\t\tremove_tag => [ \"_grokparsefailure\" ]\n\t}\n}\n\ngrok {\n\tmatch => [ \"message\", \"%{OVHMYSQLQUERY}\" ]\n}\n\ndate {\n\tmatch => [ \"timestamp\", \"UNIX\" ]\n}",
            patterns: "OVHMYSQLTIME ^# Time:.*\nOVHMYSQLHOST ^# User@Host: %{USER:query_user}?(\\[%{WORD}\\])?\\s*@?\\s*%{HOSTNAME:query_host}\\s*\\[%{IP:query_ip}?](\\s*Id:\\s*%{NUMBER:thread_id})?.*\nOVHMYSQLSTATS ^# Query_time:\\s*%{NUMBER:query_time_num:float}\\s*Lock_time:\\s*%{NUMBER:lock_time_num}\\s*Rows_sent:\\s*%{NUMBER:rows_sent_int}\\s*Rows_examined:\\s*%{NUMBER:rows_examined_int:integer}(\\s*Rows_affected:\\s*%{NUMBER:rows_affected_int:integer})?(\\s*Rows_read:\\s*%{NUMBER:rows_read_int:integer})?\nOVHMYSQLUSEDB use %{WORD:database};\nOVHMYSQLBYTES ^# Bytes_sent: %{NUMBER:bytes_sent_num:float}\nOVHMYSQLQUERY ^SET timestamp=%{NUMBER:timestamp:integer};\\n%{GREEDYDATA:query}",
            documentation: "https://docs.ovh.com/gb/en/mobile-hosting/logs-data-platform/mysql-slow-queries/"
        },
        Twitter: {
            name: "Twitter",
            input: "twitter {\n\tconsumer_key => \"XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX\"\n\tconsumer_secret => \"XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXx\"\n\toauth_token => \"XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX\"\n\toauth_token_secret => \"XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX\"\n\tkeywords => [ \"playstation\",\"Nintendo\",\"xbox\"]\n\ttype => \"tweet\"\n\tfull_tweet => true\n}",
            filter: "if [type] == \"tweet\" {\n\n\tmutate {\n\t\tadd_field => {\n\t\t\t\"message\" => \"%{text}\"\n\t\t\t\"full_message\" => \"%{text}\"\n\t\t\t\"hashtags\" => \"%{[entities][hashtags]}\"\n\t\t\t\"mentions\" =>  \"%{[entities][user_mentions]}\"\n\t\t\t\"host\" => \"twitter\"\n\t\t\t\"user_screen_name\" => \"%{[user][screen_name]}\"\n\t\t\t\"user_id\" => \"%{[user][id_str]}\"\n\t\t\t\"user_followers_count_int\" => \"%{[user][followers_count]}\"\n\t\t\t\"user_friends_count_int\" => \"%{[user][friends_count]}\"\n\t\t\t\"user_listed_count_int\" => \"%{[user][listed_count]}\"\n\t\t\t\"user_favourites_count_int\" => \"%{[user][favourites_count]}\"\n\t\t\t\"user_statuses_count_int\" => \"%{[user][statuses_count]}\"\n\t\t\t\"user_profile_image_url\" => \"%{[user][profile_image_url_https]}\"\n\t\t\t\"user_verified_bool\" => \"%{[user][verified]}\"\n\t\t}\n\t\tremove_field => [\"id_str\",\"timestamp_ms\"]\n\t}\n\n\tif [user][profile_banner_url] {\n\t\tmutate {\n\t\t\tadd_field => {\n\t\t\t\t\"user_profile_banner_url\" => \"%{[user][profile_banner_url]}\"\n\t\t\t}\n\t\t}\n\t}\n\n\tif [entities][user_mentions]  {\n\t\tclone {\n\t\t\tclones => [\"mention\"]\n\t\t}\n\t}\n\n\tif [entities][hashtags]   {\n\t\tclone {\n\t\t\tclones => [\"hashtag\"]\n\t\t}\n\t}\n\n}\n\nif [type] == \"hashtag\" {\n\n\tsplit {\n\t\tfield => \"[entities][hashtags]\"\n\t}\n\n\tmutate {\n\t\tadd_field => {\n\t\t\t\"hashtag\" =>  \"%{[entities][hashtags][text]}\"\n\t\t\t\"indice_begin_int\" =>  \"%{[entities][hashtags][indices][0]}\"\n\t\t\t\"indice_end_int\" =>  \"%{[entities][hashtags][indices][1]}\"\n\t\t}\n\t\tremove_field => [ \"retweet_count\", \"retweeted_status\", \"user\", \"text\", \"filter_level\", \"favorite_count\", \"extended_tweet\", \"entities\"]\n\t\tupdate => {\n\t\t\t\"message\" => \"#%{[entities][hashtags][text]}\"\n\t\t}\n\t}\n\n}\n\nif [type] == \"mention\" {\n\n\tsplit {\n\t\tfield => \"[entities][user_mentions]\"\n\t}\n\n\tmutate {\n\t\tadd_field => {\n\t\t\t\"mention\" =>  \"%{[entities][user_mentions][screen_name]}\"\n\t\t\t\"mention_user_id_\" =>  \"%{[entities][user_mentions][id]}\"\n\t\t\t\"indice_begin_int\" =>  \"%{[entities][user_mentions][indices][0]}\"\n\t\t\t\"indice_end_int\" =>  \"%{[entities][user_mentions][indices][1]}\"\n\t\t}\n\t\tremove_field => [ \"retweet_count\", \"retweeted_status\", \"user\", \"text\", \"filter_level\", \"favorite_count\", \"extended_tweet\", \"entities\"]\n\t\tupdate => {\n\t\t\t\"message\" => \"@%{[entities][user_mentions][screen_name]}\"\n\t\t}\n\t}\n\n}",
            patterns: "",
            documentation: "https://docs.ovh.com/gb/en/mobile-hosting/logs-data-platform/twitter/"
        },
        Nginx: {
            name: "Nginx",
            input: "beats {\n\tport => INPUT_PORT\n\tssl => true\n\tssl_certificate => \"/etc/ssl/private/server.crt\"\n\tssl_key => \"/etc/ssl/private/server.key\"\n}",
            filter: "if [type] == \"nginx-access\" {\n\tgrok {\n\t\tmatch => { \"message\" => \"%{OVHNGINXACCESS}\" }\n\t}\n}",
            patterns: "OVHNGUSERNAME [a-zA-Z\\.\\@\\-\\+_%]+\nOVHNGUSER %{OVHNGUSERNAME}\nOVHNGINXACCESS %{IPORHOST:clientip} %{OVHNGUSER:ident} %{OVHNGUSER:auth} \\[%{HTTPDATE:timestamp}\\] \"%{WORD:verb} %{URIPATHPARAM:request} HTTP/%{NUMBER:httpversion}\" %{NUMBER:response_num} (?:%{NUMBER:bytes_long}|-) (?:\"(?:%{URI:referrer}|-)\"|%{QS:referrer}) %{QS:agent}",
            documentation: "https://docs.ovh.com/gb/en/mobile-hosting/logs-data-platform/logstash-input/"
        }
    }
});
