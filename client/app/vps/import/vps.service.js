angular.module("managerApp").service("VpsService", [
    "$http",
    "$q",
    "$timeout",
    "$cacheFactory",
    "$rootScope",
    "additionalDisk.capacities",
    "additionalDisk.hasNoOption",
    "VpsTaskService",
    "ServiceHelper",
    "$translate",
    function ($http, $q, $timeout, cache, $rootScope, additionalDiskCapacities, additionalDiskHasNoOption, VpsTaskService, ServiceHelper, $translate) {
        "use strict";

        var aapiRootPath = "/sws/vps",
            swsVpsProxypass = "/vps",
            swsOrderProxypass = "/order/vps",
            swsPriceProxypass = "/price/vps",
            vpsCache = cache("UNIVERS_WEB_VPS"),
            vpsInfoCache = cache("VPS_INFO_CACHE"),
            vpsTabVeeamCache = cache("UNIVERS_WEB_VPS_TABS_VEEAM"),
            vpsTabBackupStorageCache = cache("UNIVERS_WEB_VPS_TABS_BACKUP_STORAGE"),
            requests = {
                vpsDetails : null
            },
            self = this;

        this.events = {
            tabVeeamChanged: "vps.tabs.veeam.changed"
        };

        /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

        this.getTaskInProgress = function (serviceName, type) {
            var result = null;
            return this.getSelectedVps(serviceName).then(function (vps) {
                if (vps && vps.name) {
                    return $http.get([aapiRootPath, vps.name, "tasks/uncompleted"].join("/"), {
                        serviceType: "aapi",
                        params: {
                            type: type
                        }
                    }).then(function (data) {
                        result = data.data;
                    });
                } else {
                    return $q.reject(vps);
                }
            }).then(function () {
                return result;
            }, function (http) {
                return $q.reject(http.data);
            });
        };

        this.getTaskInError = function (serviceName) {
            var result = null;
            return this.getSelectedVps(serviceName).then(function (vps) {
                if (vps && vps.name) {
                    return $http.get([aapiRootPath, vps.name, "tasks/error"].join("/"), {serviceType: "aapi"}).then(function (data) {
                        result = data.data;
                    });
                } else {
                    return $q.reject(vps);
                }
            }).then(function () {
                return result;
            }, function (http) {
                return $q.reject(http.data);
            });
        };

        /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

        function resetTabVeeam () {
            vpsTabVeeamCache.removeAll();
            $rootScope.$broadcast(self.events.tabVeeamChanged);
        }

        /*
         * Private function to reset the cache
         *
         */
        function resetCache (key) {
            if (key !== undefined) {
                if (requests[key] !== undefined) {
                    requests[key] = null;
                }
                vpsCache.remove(key);
            } else {
                vpsCache.removeAll();
                vpsInfoCache.removeAll();
                for (var request in requests) {
                    if (requests.hasOwnProperty(request)) {
                        requests[request] = null;
                    }
                }
            }
        }

        /*
         * same as getSelected without using Products (it causes problem when changing vps using sidebar)
         */
        this.getSelectedVps = function(serviceName) {
            return $http.get([aapiRootPath, serviceName,"info"].join("/"), {
                serviceType: "aapi",
                cache: vpsInfoCache
            })
                .then(result => {
                    result.data.secondaryDns = (result.data.secondaryDns === 0) ?
                        $translate.instant("vps_dashboard_secondary_dns_count_0") :
                        $translate.instant("vps_dashboard_secondary_dns_count_x", { count: result.data.secondaryDns });
                    return result.data;
                })
                .catch(ServiceHelper.errorHandler("vps_dashboard_loading_error"));
        };

        /*
         * Get monitoring data
         */
        this.getMonitoring = function (serviceName, period) {
            var monitoring = null,
            p = period != null ? period : "lastday";
            return this.getSelectedVps(serviceName).then(function (vps) {
                if (vps && vps.name) {
                    return $http.get([aapiRootPath, vps.name, "monitoring"].join("/"), { serviceType: "aapi", params: { period: p } })
                        .then(function (data) {
                            if (data) {
                                monitoring = data.data;
                            } else {
                                $q.reject(aapiRootPath + vps.name + "/monitoring?period="  + p + " : " + "No data");
                            }
                        });
                } else {
                    return $q.reject(vps);
                }
            }).then(function () {
                if (monitoring !== null) {
                    return monitoring;
                }
            }).catch(ServiceHelper.errorHandler("vps_configuration_monitoring_fail"));
        };

        /*
         * reset VPS password
         */
        this.resetPassword = function (serviceName) {
            var result = null;
            return this.getSelectedVps(serviceName).then(function (vps) {
                if (vps && vps.name) {
                    return $http.post([swsVpsProxypass, vps.name, "setPassword"].join("/"))
                        .then(function (data) {
                            result = data.data;
                        });
                } else {
                    return $q.reject(vps);
                }
            }).then(function () {
                VpsTaskService.initPoller(serviceName, "iaas.vps.detail");
                return result;
            }, function (http) {
                return $q.reject(http.data);
            });
        };

        /*
         * Reboot the VPS
         */
        this.reboot = function (serviceName, rescueMode) {
            var result = null;
            return this.getSelectedVps(serviceName).then(function (vps) {
                if (vps && vps.name) {
                    var netbootMode = rescueMode ? "rescue" : "local";
                    if (vps.netbootMode === netbootMode.toUpperCase()) {
                        return $http.post([swsVpsProxypass, vps.name, "reboot"].join("/"))
                            .then(function (data) {
                                result = data.data;
                            });
                    }

                    // The modification of netbootMode for a vps other than CLOUD 2014v1 model will make the VPS
                    // reboot. So ask an explicit reboot only if the VPS is a CLOUD 2014v1
                    if ((vps.offerType === "CLOUD" && vps.version === "_2014_V_1")) {
                        // Sleep for 40 seconds because the netboot change take some seconds to apply.
                        // It's not a good solution, it's like that since the begin
                        return $http.put([swsVpsProxypass, vps.name].join("/"), { netbootMode: netbootMode })
                            .then(function () {
                                return $timeout(function () {
                                    return $http.post([swsVpsProxypass, vps.name, "reboot"].join("/")).then(function (data) {
                                        result = data.data;
                                    });
                                }, 40000);
                            });
                    } else {
                        return $http.put([swsVpsProxypass, vps.name].join("/"), { netbootMode: netbootMode });
                    }

                } else {
                    return $q.reject(vps);
                }
            }).then(function () {
                resetCache();
                VpsTaskService.initPoller(serviceName, "iaas.vps.detail");
                return result;
            }, function (http) {
                return $q.reject(http.data);
            });
        };

        /*
         * Get a KVM access for the VPS
         */
        this.getKVMAccess = function (serviceName) {
            return $http.post([swsVpsProxypass, serviceName, "openConsoleAccess"].join("/"), { protocol: "VNCOverWebSocket" })
                .then(data => data.data)
                .catch(ServiceHelper.errorHandler());
        };

        this.getKVMConsoleUrl = function (serviceName) {
            var result = null;
            return $http.post([swsVpsProxypass, serviceName, "getConsoleUrl"].join("/")).then(function (response) {
                result = response.data;
            },
                function (err) {
                    return $q.reject(err.data);
                }
            ).then(function () {
                resetCache();
                $rootScope.$broadcast("vps.dashboard.refresh");
                return result;
            }, function (http) {
                return $q.reject(http.data);
            });
        };

        /*
         * return the templates list available for this VPS
         */
        this.getTemplates = function (serviceName) {
            return $http.get([aapiRootPath, serviceName, "templates"].join("/"), { serviceType: "aapi"})
                .then(response => response.data)
                .catch(ServiceHelper.errorHandler("vps_configuration_polling_fail"));
        };

        /*
         * Reinstall the VPS using the template identified by templateId
         */
        this.reinstall = function (serviceName, templateId, language, softIds, sshKeys, doNotSendPassword) {
            if (!templateId) {
                return $q.reject("No templateId");
            }
            return $http.post([swsVpsProxypass, serviceName, "reinstall"].join("/"), {
                    language: language,
                    softwareId: softIds,
                    sshKey: sshKeys,
                    doNotSendPassword: Boolean(doNotSendPassword),
                    templateId: templateId
                })
                .then(response => {
                    resetCache();
                    VpsTaskService.initPoller(serviceName, "iaas.vps.detail");
                    return response.data;
                })
                .catch(ServiceHelper.errorHandler("vps_configuration_reinstall_fail"))
                .finally(() => this.CloudMessage.success(this.$translate.instant("vps_configuration_reinstall_success", {serviceName: this.serviceName})));
        };

        /*
         * return the ip list for this VPS
         */
        this.getIps = function (serviceName) {
            return $http.get([aapiRootPath, serviceName, "ips"].join("/"), {serviceType: "aapi"})
                .then(data => data.data)
                .catch(ServiceHelper.errorHandler());
        };

        /*
         * Reinstall the VPS using the template identified by templateId
         */
        this.setReversesDns = function (serviceName, ips) {
            var result = null;
            return this.getSelectedVps(serviceName).then(function (vps) {
                if (!ips) {
                    return $q.reject("No ips");
                } else if (vps && vps.name) {
                    return $http.post([aapiRootPath, vps.name, "ips", "reverse"].join("/") , ips, {serviceType: "aapi"})
                        .then(data => {result = data.data});
                } else {
                    return $q.reject(vps);
                }
            }).then(function () {
                resetCache();
                $rootScope.$broadcast("vps.dashboard.refresh");
                return result;
            }, function (http) {
                return $q.reject(http.data);
            });
        };

        /*
         * Get content of summary tabs
         */
        this.getTabSummary = function (serviceName, forceRefresh) {
            var vpsName = null;
            return this.getSelectedVps(serviceName).then(function (vps) {
                if (vps && vps.name && !vps.isExpired) {
                    vpsName = vps.name;
                    if (forceRefresh) {
                        resetCache("tabSummary_" + vpsName);
                    }
                    var tabSummary = vpsCache.get("tabSummary_" + vpsName);
                    if (!tabSummary) {
                        vpsCache.put("tabSummary_" + vps.name, true);
                        return $http.get([aapiRootPath, vps.name, "tabsummary"].join("/"), {serviceType: "aapi"})
                            .then(function (response) {
                                if (response.status < 300) {
                                    vpsCache.put("tabSummary_" + vpsName, response.data);
                                    return vpsCache.get("tabSummary_" + vpsName);
                                } else {
                                    return $q.reject(response);
                                }
                            });
                    } else {
                        return tabSummary;
                    }
                } else {
                    return $q.reject(vps);
                }
            }).then(function () {
                var result = vpsCache.get("tabSummary_" + vpsName);
                if (result && (!result.messages || (angular.isArray(result.messages) && result.messages.length === 0))) {
                    return result;
                } else if (result && result.messages.length !== 0) {
                    return $q.reject(result.messages);
                } else {
                    return $q.reject(result);
                }
            }).catch(ServiceHelper.errorHandler("vps_dashboard_loading_error"));
        };

        /*
         * Get content of ips tabs
         */
        this.getTabIps = function (serviceName) {
            var vpsName = null;
            return this.getSelectedVps(serviceName).then(function (vps) {
                if (vps && vps.name) {
                    vpsName = vps.name;
                    var tabSummary = vpsCache.get("tabIps_" + vpsName);
                    if (!tabSummary) {
                        vpsCache.put("tabIps_" + vps.name, true);
                        return $http.get([aapiRootPath, vps.name, "tabips"].join("/"), {serviceType: "aapi"})
                            .then(function (response) {
                                if (response.status < 300) {
                                    vpsCache.put("tabIps_" + vpsName, response.data);
                                    return vpsCache.get("tabIps_" + vpsName);
                                } else {
                                    return $q.reject(response);
                                }
                            });
                    } else {
                        return tabSummary;
                    }
                } else {
                    return $q.reject(vps);
                }
            }).then(function () {
                var result = vpsCache.get("tabIps_" + vpsName);
                if (result && (!result.messages || (angular.isArray(result.messages) && result.messages.length === 0))) {
                    return result;
                } else if (result && result.messages.length !== 0) {
                    return $q.reject(result.messages);
                } else {
                    return $q.reject(result);
                }
            }, function (reason) {
                if (reason && reason.data !== undefined) {
                    return $q.reject(reason.data);
                } else {
                    return $q.reject(reason);
                }
            });
        };

        /*
         * Get content of secondary DNS tab
         */
        this.getTabSecondaryDns = function (serviceName, count, offset) {
            var vpsName = null,
                offsetFinal = offset,
                countFinal = count,
                cacheKey = null;
            return this.getSelectedVps(serviceName).then(function (vps) {
                if (vps && vps.name) {
                    vpsName = vps.name;
                    if (!count) {
                        countFinal = 0;
                    }
                    if (!offset) {
                        offsetFinal = 0;
                    }
                    cacheKey = "tabSecondaryDNS_" + vpsName + "_count=" + countFinal + "_offset=" + offsetFinal;
                    var tabSummary = vpsCache.get(cacheKey);
                    if (!tabSummary) {
                        vpsCache.put(cacheKey, true);
                        return $http.get([aapiRootPath, vps.name, "tabsecondarydns"].join("/"), {serviceType: "aapi"})
                            .then(function (response) {
                                if (response.status < 300) {
                                    vpsCache.put(cacheKey, response.data);
                                    return vpsCache.get(cacheKey);
                                } else {
                                    return $q.reject(response);
                                }
                            });
                    } else {
                        return tabSummary;
                    }
                } else {
                    return $q.reject(vps);
                }
            }).then(function () {
                var result = vpsCache.get(cacheKey);
                if (result && (!result.messages || (angular.isArray(result.messages) && result.messages.length === 0))) {
                    return result;
                } else if (result && result.messages.length !== 0) {
                    return $q.reject(result.messages);
                } else {
                    return $q.reject(result);
                }
            }, function (reason) {
                if (reason && reason.data !== undefined) {
                    return $q.reject(reason.data);
                } else {
                    return $q.reject(reason);
                }
            });
        };

        /*
         * Get the secondary DNS available for this VPS
         */
        this.getSecondaryDNSAvailable = function (serviceName) {
            var vpsName = null;
            return this.getSelectedVps(serviceName).then(function (vps) {
                if (vps && vps.name) {
                    vpsName = vps.name;
                    var tabSummary = vpsCache.get("tabSecondaryDNS_dns_available");
                    if (!tabSummary) {
                        vpsCache.put("tabSecondaryDNS_dns_available", true);
                        return $http.get([swsVpsProxypass, vps.name, "secondaryDnsNameServerAvailable"].join("/"))
                            .then(function (response) {
                                if (response.status < 300) {
                                    vpsCache.put("tabSecondaryDNS_dns_available", response.data);
                                    return vpsCache.get("tabSecondaryDNS_dns_available");
                                } else {
                                    return $q.reject(response);
                                }
                            });
                    } else {
                        return tabSummary;
                    }
                } else {
                    return $q.reject(vps);
                }
            }).then(function () {
                var result = vpsCache.get("tabSecondaryDNS_dns_available");
                if (result && (!result.messages || (angular.isArray(result.messages) && result.messages.length === 0))) {
                    return result;
                } else if (result && result.messages.length !== 0) {
                    return $q.reject(result.messages);
                } else {
                    return $q.reject(result);
                }
            }, function (reason) {
                if (reason && reason.data !== undefined) {
                    return $q.reject(reason.data);
                } else {
                    return $q.reject(reason);
                }
            });
        };

        /*
         * Add a domain to the secondary DNS for the VPS
         *
         */
        this.addSecondaryDnsDomain = function (serviceName, domain) {
            var result = null;
            return this.getSelectedVps(serviceName).then(function (vps) {
                if (vps && vps.name) {
                    return $http["post"]([swsVpsProxypass, vps.name, "secondaryDnsDomains"].join("/"), { domain: domain })
                        .then(function (data) {
                            result = data.data;
                        });
                } else {
                    return $q.reject(vps);
                }
            }).then(function () {
                resetCache();
                $rootScope.$broadcast("vps.tabs.secondarydns.refresh");
                $rootScope.$broadcast("vps.dashboard.vpsonly.refresh");
                return result;
            }, function (reason) {
                if (reason && reason.data !== undefined) {
                    return $q.reject(reason.data);
                } else {
                    return $q.reject(reason);
                }
            });
        };

        /*
         * delete the domain from secondary DNS
         */
        this.deleteSecondaryDnsDomain = function (serviceName, domain) {
            var result = null, vpsName = null;
            return this.getSelectedVps(serviceName).then(function (vps) {
                if (vps && vps.name && domain) {
                    vpsName = vps.name;
                    return $http["delete"]([swsVpsProxypass, vps.name, "secondaryDnsDomains", domain].join("/"))
                        .then(function (data) {
                            result = data.data;
                        });
                } else {
                    return $q.reject(vps);
                }
            }).then(function () {
                resetCache();
                $rootScope.$broadcast("vps.tabs.secondarydns.refresh");
                $rootScope.$broadcast("vps.dashboard.vpsonly.refresh");
                return result;
            }, function (reason) {
                if (reason && reason.data !== undefined) {
                    return $q.reject(reason.data);
                } else {
                    return $q.reject(reason);
                }
            });
        };

        /*
         * create a snapshot for the VPS
         */
        this.takeSnapshot = function (serviceName, description) {
            var result = null, vpsName = null;
            return this.getSelectedVps(serviceName).then(function (vps) {
                if (vps && vps.name) {
                    vpsName = vps.name;
                    return $http.post([swsVpsProxypass, vps.name, "createSnapshot"].join("/"), description)
                        .then(function (data) {
                            result = data.data;
                        });
                } else {
                    return $q.reject(vps);
                }
            }).then(function () {
                resetCache("tabSummary_" + vpsName);
                VpsTaskService.initPoller(serviceName, "iaas.vps.detail");
                return result;
            }, function (reason) {
                if (reason && reason.data !== undefined) {
                    return $q.reject(reason.data);
                } else {
                    return $q.reject(reason);
                }
            });
        };

        /*
         * restore a snapshot for the VPS
         */
        this.restoreSnapshot = function (serviceName) {
            var result = null;
            return this.getSelectedVps(serviceName).then(function (vps) {
                if (vps && vps.name) {
                    return $http.post([swsVpsProxypass, vps.name, "snapshot/revert"].join("/"))
                        .then(function (data) {
                            result = data.data;
                        });
                } else {
                    return $q.reject(vps);
                }
            }).then(function () {
                resetCache();
                VpsTaskService.initPoller(serviceName, "iaas.vps.detail");
                return result;
            }, function (reason) {
                if (reason && reason.data !== undefined) {
                    return $q.reject(reason.data);
                } else {
                    return $q.reject(reason);
                }
            });
        };

        /*
         * delete the snapshot for the VPS
         */
        this.deleteSnapshot = function (serviceName) {
            var result = null, vpsName = null;
            return this.getSelectedVps(serviceName).then(function (vps) {
                if (vps && vps.name) {
                    vpsName = vps.name;
                    return $http["delete"]([swsVpsProxypass, vps.name, "snapshot"].join("/"))
                        .then(function (data) {
                            result = data.data;
                        });
                } else {
                    return $q.reject(vps);
                }
            }).then(function () {
                resetCache("tabSummary_" + vpsName);
                VpsTaskService.initPoller(serviceName, "iaas.vps.detail");
                return result;
            }, function (reason) {
                if (reason && reason.data !== undefined) {
                    return $q.reject(reason.data);
                } else {
                    return $q.reject(reason);
                }
            });
        };

        /*
         * order an option for the VPS
         */
        this.orderOption = function (serviceName, option, duration) {
            var result = null, vpsName = null;
            return this.getSelectedVps(serviceName).then(function (vps) {
                if (vps && vps.name && option && duration) {
                    vpsName = vps.name;
                    return $http.post([aapiRootPath, vps.name, "order", "options"].join("/"), { option: option, duration: duration }, {serviceType: "aapi"})
                        .then(function (data) {
                            result = data.data;
                        });
                } else {
                    return $q.reject(vps);
                }
            }).then(function () {
                resetCache("tabSummary_" + vpsName);
                return result;
            }, function (reason) {
                if (reason && reason.data !== undefined) {
                    return $q.reject(reason.data);
                } else {
                    return $q.reject(reason);
                }
            });
        };

        /*
         * get details for an option for the VPS
         */
        this.getOptionDetails = function (serviceName, option) {
            var result = null, vpsName = null;
            return this.getSelectedVps(serviceName).then(function (vps) {
                if (vps && vps.name && option) {
                    vpsName = vps.name;
                    return $http.get([aapiRootPath, vps.name, "options", option].join("/"), {serviceType: "aapi"})
                        .then(function (data) {
                            result = data.data;
                        });
                } else {
                    return $q.reject(vps);
                }
            }).then(function () {
                return result;
            }, function (reason) {
                if (reason && reason.data !== undefined) {
                    return $q.reject(reason.data);
                } else {
                    return $q.reject(reason);
                }
            });
        };

        // HOT FIX remove this fukin shit
        this.getOptionDetails2 = function (option, vps, duration) {
            return $q.all([
                $http.get(["apiv6/price/vps/2015v1/ssd/option/", option].join("")),
                $http.get(["apiv6/order/vps/", vps.name, "/snapshot/", duration].join(""))
            ]);
        };

        // HOT FIX remove this fukin shit
        this.getOptionSnapshot = function (vps) {
            return $http.get(["apiv6/order/vps/", vps.name, "/snapshot"].join(""));
        };

        this.getOptionSnapshotFormated = function (serviceName, vps) {
            if (vps.version === "_2015_V_1" && vps.offerType === "SSD") {
                return this.getOptionSnapshot(vps)
                    .then(d => this.getOptionDetails2("snapshot", vps, d.data[0]))
                    .then(data => {
                            return {
                                unitaryPrice: data[0].data.text,
                                withoutTax: data[1].data.prices.withoutTax.text,
                                withTax: data[1].data.prices.withTax.text,
                                duration: {duration: d.data[0]}
                            }
                        });
            } else {
                return this.getOptionDetails(serviceName, "snapshot").then(data => data.results[0]);
            }
        };

        // HOT FIX remove this fukin shit
        this.getPriceOptions = function (vps) {
            return $http.get(["/price/vps", vps.version.toLowerCase().replace(/_/g, ""), vps.offerType.toLowerCase(), "option/automatedBackup"].join("/"));
        };

        this.cancelOption = function (serviceName, option) {

            return this.getSelectedVps(serviceName).then(function (vps) {
                return $http["delete"]([swsVpsProxypass, vps.name, "option", option].join("/"))
                    ["catch"](function (err) {
                        return err && err.data ? $q.reject(err.data) : $q.reject(err);
                    });
            });
        };

        this.getOptionStatus = function (serviceName, option) {

            return this.getSelectedVps(serviceName).then(function (vps) {
                return $http.get([swsVpsProxypass, vps.name, "option", option].join("/"))
                    .then(function (response) {
                        return response.data;
                    });
            });
        };

        /*
         * upgrade the VPS tothe specified model
         */
        this.upgrade = function (serviceName, model, duration) {
            var result = null, vpsName = null;
            return this.getSelectedVps(serviceName).then(function (vps) {
                if (vps && vps.name && model && duration) {
                    vpsName = vps.name;
                    return $http.post([swsOrderProxypass, vps.name, "upgrade", duration].join("/"), { model: model })
                        .then(function (data) {
                            result = data.data;
                        });
                } else {
                    return $q.reject(vps);
                }
            }).then(function () {
                resetCache();
                return result;
            }, function (reason) {
                if (reason && reason.data !== undefined) {
                    return $q.reject(reason.data);
                } else {
                    return $q.reject(reason);
                }
            });
        };

        /*
         * get details for an option for the VPS
         */
        this.upgradesList = function (serviceName) {
            var result = null, vpsName = null;
            return this.getSelectedVps(serviceName).then(function (vps) {
                if (vps && vps.name) {
                    vpsName = vps.name;
                    return $http.get([aapiRootPath, vps.name, "upgrade"].join("/"), {serviceType: "aapi"})
                        .then(function (data) {
                            result = data.data;
                        });
                } else {
                    return $q.reject(vps);
                }
            }).then(function () {
                return result;
            }, function (reason) {
                if (reason && reason.data !== undefined) {
                    return $q.reject(reason.data);
                } else {
                    return $q.reject(reason);
                }
            });
        };

        /*
         * Get content of veeam tab
         */
        this.getVeeamInfo = function (serviceName) {
            return $http.get([swsVpsProxypass, serviceName, "automatedBackup"].join("/"))
                .then(response => response.data);
        };

        this.getVeeamAttachedBackup = function (serviceName) {
                return $http.get([swsVpsProxypass, serviceName, "automatedBackup/attachedBackup"].join("/"))
                    .then(response => response.data);
        };

        this.getVeeam = function (serviceName) {
            var info;
            return $q.all([self.getVeeamInfo(serviceName), self.getVeeamAttachedBackup(serviceName)])
                .then(response => {
                    if (response.length > 1) {
                        info = response[0];
                        info.accessInfos = response[1][0];
                    }
                    return info;
                })
                .catch(() => {
                    return { state: "disabled" };
                });
        };

        this.getTabVeeam = function (serviceName, state, forceRefresh) {
            if (forceRefresh) {
                resetTabVeeam();
            }
            return $http.get([swsVpsProxypass, serviceName, "automatedBackup/restorePoints"].join("/"), {
                params: {
                    state: state
                },
                cache: vpsTabVeeamCache
            }).then(response => response.data);
        };

        this.veeamRestorePointMount = function (serviceName, restorePoint) {
            return this.getSelectedVps(serviceName).then(function (vps) {
                return $http.post([swsVpsProxypass, vps.name, "automatedBackup/restore"].join("/"), {
                    changePassword: false,
                    restorePoint: restorePoint,
                    type: "file"
                }).then(function (response) {
                    resetTabVeeam();
                    VpsTaskService.initPoller(serviceName, "iaas.vps.detail");
                    return response.data;
                });
            });
        };

        this.veeamRestorePointRestore = function (serviceName, restorePoint, changePassword) {
            return this.getSelectedVps(serviceName).then(function (vps) {
                return $http.post([swsVpsProxypass, vps.name, "automatedBackup/restore"].join("/"), {
                    changePassword: changePassword,
                    restorePoint: restorePoint,
                    type: "full"
                }).then(function (response) {
                    resetTabVeeam();
                    VpsTaskService.initPoller(serviceName, "iaas.vps.detail");
                    return response.data;
                });
            });
        };

        this.veeamRestorePointUmount = function (serviceName, restorePoint) {
            return this.getSelectedVps(serviceName).then(function (vps) {

                return $http.post([swsVpsProxypass, vps.name, "automatedBackup/detachBackup"].join("/"), {
                    restorePoint: restorePoint
                }).then(function (response) {
                        resetTabVeeam();
                        VpsTaskService.initPoller(serviceName, "iaas.vps.detail");
                        return response.data;
                    });
            });
        };

        /**
         * Get option veeam
         */
        this.getVeeamOption = function (serviceName) {
            return this.getSelectedVps(serviceName).then(function (vps) {
                return $http.get([aapiRootPath, vps.name, "automatedBackup"].join("/"), {
                    serviceType: "aapi",
                    cache: vpsCache
                }).then(function (response) {
                    return response.data;
                }).catch(function (error) {
                    return error.data;
                });
            });
        };

        /**
         * Order the option veeam
         */
        this.orderVeeamOption = (serviceName, duration) => {
            return this.getSelectedVps(serviceName)
                .then(vps => {
                    return $http.post([swsOrderProxypass, vps.name, "automatedBackup", duration].join("/"), {});
                })
                .then(response => response.data);
        };
        /**
         * Update the VPS
         */
        this.update = function (serviceName, newValue) {
            return this.getSelectedVps(serviceName).then(function (vps) {
                return $http.put([swsVpsProxypass, vps.name].join("/"), newValue)
                    .then(function (response) {
                        resetCache();
                        VpsTaskService.initPoller(serviceName, "iaas.vps.detail");
                        return response.data;
                    });
            });
        };

        /**
         * Update the VPS display name
         */
        this.updateDisplayName = function (serviceName, newValue) {
            return this.getSelectedVps(serviceName)
                .then(function (vps) {
                    return $http.put([swsVpsProxypass, vps.name].join("/"), newValue)
                        .then(function (response) {
                            resetCache();
                            $rootScope.$broadcast("global_display_name_change", {
                                serviceName: vps.name,
                                displayName: newValue.displayName
                            });
                            return response.data;
                        });
                });
        };

        // BackupStorage ------------------------------------------------------------------------------------

        this.getBackupStorageInformation = function (serviceName) {
            return $http.get([aapiRootPath, serviceName, "backupStorage"].join("/"), {serviceType: "aapi"})
                .then(response => {
                    let backupInfo = response.data;
                    if (backupInfo.activated === true && backupInfo.quota) {
                        if (backupInfo.usage === 0) {
                            backupInfo.usage = {
                                unit: "%",
                                value: 0
                            };
                        }
                    }
                    return backupInfo;
                })
                .catch(ServiceHelper.errorHandler());
        };

        this.getBackupStorageTab = function (serviceName, count, offset) {
            vpsTabBackupStorageCache.removeAll();
            return $http.get([aapiRootPath, serviceName, "backupStorage/access"].join("/"), {
                serviceType: "aapi",
                cache: vpsTabBackupStorageCache,
                params: {
                    count: count,
                    offset: offset
                }
            })
            .then(response => response.data);
        };

        this.getBackupStorageAuthorizableBlocks = function (serviceName) {
            return this.getSelectedVps(serviceName).then(function (vps) {
                return $http.get([aapiRootPath, vps.name, "backupStorage/access/authorizableBlocks"].join("/"), {serviceType: "aapi"})
                    .then(function (response) {
                        return response.data;
                    });
            });
        };

        this.postBackupStorageAccess = function (serviceName, ipBlocksList, ftp, nfs, cifs) {
            return this.getSelectedVps(serviceName).then(function (vps) {
                return $http.post([aapiRootPath, vps.name, "backupStorage/access/add"].join("/"), {
                    ipBlocksList: ipBlocksList,
                    ftp: ftp,
                    nfs: nfs,
                    cifs: cifs
                }, {serviceType: "aapi"}).then(function (response) {
                    return response.data;
                });
            });
        };

        this.putBackupStorageAccess = function (serviceName, ipBlock, ftp, nfs, cifs) {
            return this.getSelectedVps(serviceName).then(function (vps) {
                return $http.put([swsVpsProxypass, vps.name, "backupftp", "access", encodeURIComponent(ipBlock)].join("/"), {
                    ftp: ftp,
                    nfs: nfs,
                    cifs: cifs
                }).then(function (response) {
                    return response.data;
                });
            });
        };

        this.deleteBackupStorageAccess = function (serviceName, ipBlock) {
            return this.getSelectedVps(serviceName).then(function (vps) {
                return $http["delete"]([swsVpsProxypass, vps.name, "backupftp", "access", encodeURIComponent(ipBlock)].join("/"))
                    .then(function (response) {
                        return response.data;
                    });
            });
        };

        this.requestFtpBackupPassword = function (serviceName) {
            return this.getSelectedVps(serviceName).then(function (vps) {
                return $http.post([swsVpsProxypass, vps.name, "backupftp/password"].join("/"))
                    .then(function (response) {
                        return response.data;
                    });
            });
        };

        this.getWindowsOptionDurations = function (serviceName) {
            return this.getSelectedVps(serviceName).then(function (vps) {
                return $http.get([swsOrderProxypass, vps.name, "windows"].join("/"))
                    .then(function (response) {
                        return response.data;
                    });
            });
        };

        this.getWindowsOptionOrder = function (serviceName, duration) {
            return this.getSelectedVps(serviceName).then(function (vps) {
                return $http.get([swsOrderProxypass, vps.name, "windows", duration].join("/"))
                    .then(function (response) {
                        return response.data;
                    });
            });
        };

        this.postWindowsOptionOrder = function (serviceName, duration) {
            return this.getSelectedVps(serviceName).then(function (vps) {
                return $http.post([swsOrderProxypass, vps.name, "windows", duration].join("/"))
                    .then(function (response) {
                        return response.data;
                    });
            });
        };

        // Additional disks ------------------------------------------------------------------------------------
        this.hasAdditionalDiskOption = serviceName => {
            return this.getSelectedVps(serviceName).then(vps => {
                if (!_.include(vps.availableOptions, "ADDITIONAL_DISK")) {
                    return $q.reject(additionalDiskHasNoOption);
                }
                return this.canOrderOption(serviceName, "additionalDisk");
            });
        };

        this.canOrderOption = (serviceName, optionName) => {
            return $http.get([swsOrderProxypass, serviceName].join("/")).then(response => {
                if (_.include(response.data, optionName)) {
                    return response.data;
                }
                return $q.reject(additionalDiskHasNoOption);
            });
        };

        this.getAdditionalDiskPrices = function (serviceName) {
            return this.getSelectedVps(serviceName).then(function (vps) {
                return $q.all([
                    $http.get([swsPriceProxypass, "2015v1", vps.offerType.toLowerCase(), "option", additionalDiskCapacities[0].option].join("/")),
                    $http.get([swsPriceProxypass, "2015v1", vps.offerType.toLowerCase(), "option", additionalDiskCapacities[1].option].join("/")),
                    $http.get([swsPriceProxypass, "2015v1", vps.offerType.toLowerCase(), "option", additionalDiskCapacities[2].option].join("/")),
                    $http.get([swsPriceProxypass, "2015v1", vps.offerType.toLowerCase(), "option", additionalDiskCapacities[3].option].join("/"))
                ]).then(function (responses) {
                    var prices = [], i = 0;
                    angular.forEach(responses, function (capacity) {
                        capacity.data.type = additionalDiskCapacities[i].option;
                        capacity.data.size = additionalDiskCapacities[i++].size;
                        prices.push(capacity.data);
                    });
                    return prices;
                });
            });
        };

        this.getAllowedDuration = function (serviceName, capacity) {
            return this.getSelectedVps(serviceName).then(function (vps) {
                var url = [swsOrderProxypass, vps.name, "additionalDisk"].join("/");
                return $http.get(url, { params: { additionalDiskSize: capacity } }).then(function (duration) {
                    return duration.data[0];
                });
            });
        };

        this.getAdditionalDiskFinalPrice = function (serviceName, capacity, duration) {
            return this.getSelectedVps(serviceName).then(function (vps) {
                var url = [swsOrderProxypass, vps.name, "additionalDisk", duration].join("/");
                return $http.get(url, { params: { additionalDiskSize: capacity } }).then(function (response) {
                    return response.data;
                });
            });
        };

        this.postAdditionalDiskOrder = function (serviceName, capacity, duration) {
            return this.getSelectedVps(serviceName).then(function (vps) {
                var url = [swsOrderProxypass, vps.name, "additionalDisk", duration].join("/");
                return $http.post(url, { additionalDiskSize: capacity }).then(function (response) {
                    return response.data;
                });
            });
        };

        this.getDisks = function (serviceName) {
            return $http.get([swsVpsProxypass, serviceName, "disks"].join("/"))
                .then(response => response.data)
                .catch(ServiceHelper.errorHandler("vps_dashboard_loading_error"));
        };

        this.getDiskInfo = function (serviceName, id) {
            return $http.get([swsVpsProxypass, serviceName, "disks", id].join("/"))
                .then(response => response.data)
                .catch(ServiceHelper.errorHandler("vps_dashboard_loading_error"));
        };

        this.showOnlyAdditionalDisk = function (disks) {
            _.remove(disks, function (currentObject) {
                return currentObject.type === "primary";
            });
            return disks;
        };

        // Service info
        this.getServiceInfos = function (serviceName) {
            return this.getSelectedVps(serviceName).then(vps => {
                return $http.get([swsVpsProxypass, serviceName, "serviceInfos"].join("/"))
                    .then(response => {
                        response.data.offer = vps.model;
                        return response.data;
                    })
                    .catch(ServiceHelper.errorHandler("vps_dashboard_loading_error"));
            });
        };

        this.isAutoRenewable = function (serviceName) {
            return this.getSelectedVps(serviceName).then(function (vps) {
                return (moment(vps.expiration).diff(moment().date(), 'days') > 0);
            });
        };
    }
]);
