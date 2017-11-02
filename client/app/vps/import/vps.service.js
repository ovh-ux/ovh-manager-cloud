angular.module("managerApp").service("VpsService", [
    "Products",
    "$http",
    "$q",
    "$timeout",
    "$cacheFactory",
    "$rootScope",
    "Polling",
    "additionalDisk.capacities",
    "additionalDisk.hasNoOption",
    function (Products, $http, $q, $timeout, cache, $rootScope, Polling, additionalDiskCapacities, additionalDiskHasNoOption) {
        "use strict";

        var aapiRootPath = "/sws/vps",
            swsVpsProxypass = "apiv6/vps",
            swsOrderProxypass =  "apiv6/order/vps",
            swsPriceProxypass = "apiv6/price/vps",
            vpsCache = cache("UNIVERS_WEB_VPS"),
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

        this.getTaskPath = function (taskId) {
            return Products.getSelectedProduct().then(function (product) {
                return [swsVpsProxypass, product.name, "tasks", taskId].join("/");
            });
        };

        this.addTaskFast = function (task, scopeId) {
            var pollPromise = $q.defer();

            self.getTaskPath(task.id).then(function (taskUrl) {

                Polling.addTaskFast(taskUrl, task, scopeId).then(function (state){
                    pollPromise.resolve(state);
                    if (Polling.isDone(state)){
                        $rootScope.$broadcast("tasks.update");
                    }
                }, function (data){
                    pollPromise.reject(data);
                    $rootScope.$broadcast("tasks.update");
                });
            });
            return pollPromise.promise;
        };

        this.addTask = function (task, scopeId) {
            var pollPromise = $q.defer();

            self.getTaskPath(task.id).then(function (taskUrl) {
                Polling.addTask(taskUrl, task, scopeId).then(function (state){
                    pollPromise.resolve(state);
                    if (Polling.isDone(state)){
                        $rootScope.$broadcast("tasks.update");
                    }
                }, function (data){
                    pollPromise.reject({ type: "ERROR", message: data.comment });
                    $rootScope.$broadcast("tasks.update");
                });
            });
            return pollPromise.promise;
        };

        this.getTaskInProgress = function (type) {
            var result = null;
            return this.getSelected().then(function (vps) {
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

        this.getTaskInError = function () {
            var result = null;
            return this.getSelected().then(function (vps) {
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
                for (var request in requests) {
                    if (requests.hasOwnProperty(request)) {
                        requests[request] = null;
                    }
                }
            }
        }

        /*
         * get Selected VPS
         */
        this.getSelected = function (forceRefresh) {
            if (forceRefresh === true) {
                resetCache();
            }
            return Products.getSelectedProduct().then(function (product) {
                if (product) {
                    var selectedVps = vpsCache.get("vps");
                    if (!selectedVps) {
                        if (requests.vpsDetails === null) {
                            requests.vpsDetails = $http.get([aapiRootPath, product.name,"info"].join("/"), {serviceType: "aapi"}).then(function (result) {
                                vpsCache.put("vps", result.data);
                            });
                        }
                        return requests.vpsDetails;
                    } else {
                        return selectedVps;
                    }
                } else {
                    return $q.reject(product);
                }
            }).then(function () {
                return vpsCache.get("vps");
            }, function (reason) {
                return $q.reject(reason);
            });
        };

        /*
         * Get monitoring data
         */
        this.getMonitoring = function (period) {
            var monitoring = null,
            p = period != null ? period : "lastday";
            return this.getSelected().then(function (vps) {
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
            }, function (reason) {
                if (reason.data !== undefined) {
                    return $q.reject(reason.data);
                } else {
                    return $q.reject(reason);
                }
            });
        };

        /*
         * reset VPS password
         */
        this.resetPassword = function () {
            var result = null;
            return this.getSelected().then(function (vps) {
                if (vps && vps.name) {
                    return $http.post([swsVpsProxypass, vps.name, "setPassword"].join("/")).then(function (data) {
                        result = data.data;
                    });
                } else {
                    return $q.reject(vps);
                }
            }).then(function () {
                $rootScope.$broadcast("vps.TASK.polling", result);
                return result;
            }, function (http) {
                return $q.reject(http.data);
            });
        };

        /*
         * Reboot the VPS
         */
        this.reboot = function (rescueMode) {
            var result = null;
            return this.getSelected().then(function (vps) {
                if (vps && vps.name) {
                    var netbootMode = rescueMode ? "rescue" : "local";
                    if (vps.netbootMode === netbootMode.toUpperCase()) {
                        return $http.post([swsVpsProxypass, vps.name, "reboot"].join("/")).then(function (data) {
                            result = data.data;
                        });
                    }

                    // The modification of netbootMode for a vps other than CLOUD 2014v1 model will make the VPS
                    // reboot. So ask an explicit reboot only if the VPS is a CLOUD 2014v1
                    if ((vps.offerType === "CLOUD" && vps.version === "_2014_V_1")) {
                        // Sleep for 40 seconds because the netboot change take some seconds to apply.
                        // It's not a good solution, it's like that since the begin
                        return $http.put([swsVpsProxypass, vps.name].join("/"), { netbootMode: netbootMode }).then( function () {
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
                $rootScope.$broadcast("vps.dashboard.refresh");
                return result;
            }, function (http) {
                return $q.reject(http.data);
            });
        };

        /*
         * Get a KVM access for the VPS
         */
        this.getKVMAccess = function () {
            var result = null;
            return this.getSelected().then(function (vps) {
                if (vps && vps.name) {
                    return $http.post([swsVpsProxypass, vps.name, "openConsoleAccess"].join("/"), { protocol: "VNCOverWebSocket" })
                        .then(function (data) {
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
        this.getTemplates = function () {
            var result = null;
            return this.getSelected().then(function (vps) {
                if (vps && vps.name) {
                    return $http.get([aapiRootPath, vps.name, "templates"].join("/"), {
                        serviceType: "aapi"
                    }).then(function (data) {
                        result = data.data;
                    });
                } else {
                    $q.reject(vps);
                }
            }).then(function () {
                return result;
            }, function (http) {
                return $q.reject(http.data);
            });
        };

        /*
         * Reinstall the VPS using the template identified by templateId
         */
        this.reinstall = function (templateId, language, softIds, sshKeys, doNotSendPassword) {
            var result = null;
            return this.getSelected().then(function (vps) {
                if (!templateId) {
                    return $q.reject("No templateId");
                } else if (vps && vps.name) {
                    return $http.post([swsVpsProxypass, vps.name, "reinstall"].join("/"), {
                        language: language,
                        softwareId: softIds,
                        sshKey: sshKeys,
                        doNotSendPassword: Boolean(doNotSendPassword),
                        templateId: templateId
                    }).then(function (data) {
                        result = data.data;
                    });
                } else {
                    return $q.reject(vps);
                }
            }).then(function () {
                resetCache();
                $rootScope.$broadcast("vps.dashboard.refresh", true);
                return result;
            }, function (http) {
                return $q.reject(http.data);
            });
        };

        /*
         * return the ip list for this VPS
         */
        this.getIps = function () {
            var result = null;
            return this.getSelected().then(function (vps) {
                if (vps && vps.name) {
                    return $http.get([aapiRootPath, vps.name, "ips"].join("/"), {serviceType: "aapi"}).then(function (data) {
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

        /*
         * Reinstall the VPS using the template identified by templateId
         */
        this.setReversesDns = function (ips) {
            var result = null;
            return this.getSelected().then(function (vps) {
                if (!ips) {
                    return $q.reject("No ips");
                } else if (vps && vps.name) {
                    return $http.post([aapiRootPath, vps.name, "ips", "reverse"].join("/") , ips, {serviceType: "aapi"})
                        .then(function (data) {
                            result = data.data;
                        });
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
        this.getTabSummary = function (forceRefresh) {
            var vpsName = null;
            return this.getSelected().then(function (vps) {
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
            }, function (reason) {
                if (reason && reason.data !== undefined) {
                    return $q.reject(reason.data);
                } else {
                    return $q.reject(reason);
                }
            });
        };

        /*
         * Get content of ips tabs
         */
        this.getTabIps = function () {
            var vpsName = null;
            return this.getSelected().then(function (vps) {
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
        this.getTabSecondaryDns = function (count, offset) {
            var vpsName = null,
                offsetFinal = offset,
                countFinal = count,
                cacheKey = null;
            return this.getSelected().then(function (vps) {
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
        this.getSecondaryDNSAvailable = function () {
            var vpsName = null;
            return this.getSelected().then(function (vps) {
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
        this.addSecondaryDnsDomain = function (domain) {
            var result = null;
            return this.getSelected().then(function (vps) {
                if (vps && vps.name) {
                    return $http.post([swsVpsProxypass, vps.name, "secondaryDnsDomains"].join("/"), { domain: domain })
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
        this.deleteSecondaryDnsDomain = function (domain) {
            var result = null, vpsName = null;
            return this.getSelected().then(function (vps) {
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
        this.takeSnapshot = function (description) {
            var result = null, vpsName = null;
            return this.getSelected().then(function (vps) {
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
                $rootScope.$broadcast("vps.TASK.polling", result);
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
        this.restoreSnapshot = function () {
            var result = null;
            return this.getSelected().then(function (vps) {
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
                $rootScope.$broadcast("vps.TASK.polling", result);
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
        this.deleteSnapshot = function () {
            var result = null, vpsName = null;
            return this.getSelected().then(function (vps) {
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
                $rootScope.$broadcast("vps.TASK.polling", result);
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
        this.orderOption = function (option, duration) {
            var result = null, vpsName = null;
            return this.getSelected().then(function (vps) {
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
        this.getOptionDetails = function (option) {
            var result = null, vpsName = null;
            return this.getSelected().then(function (vps) {
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

        // HOT FIX remove this fukin shit
        this.getPriceOptions = function (vps) {
            return $http.get(["apiv6/price/vps/", vps.version.toLowerCase().replace(/_/g, ""), "/", vps.offerType.toLowerCase(), "/option/automatedBackup"].join(""));
        };

        this.cancelOption = function (option) {

            return this.getSelected().then(function (vps) {
                return $http["delete"]([swsVpsProxypass, vps.name, "option", option].join("/"))
                    ["catch"](function (err) {
                        return err && err.data ? $q.reject(err.data) : $q.reject(err);
                    });
            });
        };

        this.getOptionStatus = function (option) {

            return this.getSelected().then(function (vps) {
                return $http.get([swsVpsProxypass, vps.name, "option", option].join("/"))
                    .then(function (response) {
                        return response.data;
                    });
            });
        };

        /*
         * upgrade the VPS tothe specified model
         */
        this.upgrade = function (model, duration) {
            var result = null, vpsName = null;
            return this.getSelected().then(function (vps) {
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
        this.upgradesList = function () {
            var result = null, vpsName = null;
            return this.getSelected().then(function (vps) {
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
        this.getVeeamInfo = function () {
            return self.getSelected().then(function (vps) {
                return $http.get([swsVpsProxypass, vps.name, "automatedBackup"].join("/"))
                    .then(function (response) {
                        return response.data;
                    });
            });
        };

        this.getVeeamAttachedBackup = function () {
            return self.getSelected().then(function (vps) {
                return $http.get([swsVpsProxypass, vps.name, "automatedBackup/attachedBackup"].join("/"))
                    .then(function (response) {
                        return response.data;
                    });
            });
        };

        this.getVeeam = function () {
            var info;
            return $q.all([self.getVeeamInfo(), self.getVeeamAttachedBackup()])
                .then(function (response) {
                    if (response.length > 1) {
                        info = response[0];
                        info.accessInfos = response[1][0];
                    }

                    return info;
                });
        };

        this.getTabVeeam = function (state, forceRefresh) {
            if (forceRefresh) {
                resetTabVeeam();
            }
            return this.getSelected().then(function (vps) {
                return $http.get([swsVpsProxypass, vps.name, "automatedBackup/restorePoints"].join("/"), {
                    params: {
                        state: state
                    },
                    cache: vpsTabVeeamCache
                }).then(function (response) {
                    return response.data;
                });
            });
        };

        this.veeamRestorePointMount = function (restorePoint) {
            return this.getSelected().then(function (vps) {
                return $http.post([swsVpsProxypass, vps.name, "automatedBackup/restore"].join("/"), {
                    changePassword: false,
                    restorePoint: restorePoint,
                    type: "file"
                }).then(function (response) {
                    resetTabVeeam();
                    $rootScope.$broadcast("vps.TASK.polling", response.data);
                    return response.data;
                });
            });
        };

        this.veeamRestorePointRestore = function (restorePoint, changePassword) {
            return this.getSelected().then(function (vps) {
                return $http.post([swsVpsProxypass, vps.name, "automatedBackup/restore"].join("/"), {
                    changePassword: changePassword,
                    restorePoint: restorePoint,
                    type: "full"
                }).then(function (response) {
                    resetTabVeeam();
                    $rootScope.$broadcast("vps.TASK.polling", response.data);
                    return response.data;
                });
            });
        };

        this.veeamRestorePointUmount = function (restorePoint) {
            return this.getSelected().then(function (vps) {

                return $http.post([swsVpsProxypass, vps.name, "automatedBackup/detachBackup"].join("/"), {
                    restorePoint: restorePoint
                }).then(function (response) {
                        resetTabVeeam();
                        $rootScope.$broadcast("vps.TASK.polling", response.data);
                        return response.data;
                    });
            });
        };

        /**
         * Get option veeam
         */
        this.getVeeamOption = function () {
            return this.getSelected().then(function (vps) {
                return $http.get([aapiRootPath, vps.name, "automatedBackup"].join("/"), {
                    serviceType: "aapi",
                    cache: vpsCache
                }).then(function (response) {
                    return response.data;
                });
            });
        };

        /**
         * Order the option veeam
         */
        this.orderVeeamOption = function (duration) {
            return this.getSelected().then(function (vps) {
                return $http.post([swsOrderProxypass, vps.name, "automatedBackup", duration].join("/"))
                    .then(function (response) {
                        return response.data;
                    });
            });
        };

        /**
         * Update the VPS
         */
        this.update = function (newValue) {
            return this.getSelected().then(function (vps) {
                return $http.put([swsVpsProxypass, vps.name].join("/"), newValue)
                    .then(function (response) {
                        return response.data;
                    });
            });
        };

        /**
         * Update the VPS display name
         */
        this.updateDisplayName = function (newValue) {
            return this.getSelected()
                .then(function (vps) {
                    return $http.put([swsVpsProxypass, vps.name].join("/"), newValue)
                        .then(function (response) {
                            $rootScope.$broadcast("global_display_name_change", {
                                serviceName: vps.name,
                                displayName: newValue.displayName
                            });
                            return response.data;
                        });
                });
        };

        // BackupStorage ------------------------------------------------------------------------------------

        this.getBackupStorageInformation = function () {
            return this.getSelected().then(function (vps) {
                return $http.get([aapiRootPath, vps.name, "backupStorage"].join("/"), {serviceType: "aapi"})
                    .then(function (response) {
                        return response.data;
                    });
            });
        };

        this.getBackupStorageTab = function (count, offset, forceRefresh) {
            if (forceRefresh) {
                vpsTabBackupStorageCache.removeAll();
            }
            return this.getSelected().then(function (vps) {
                return $http.get([aapiRootPath, vps.name, "backupStorage/access"].join("/"), {
                    serviceType: "aapi",
                    cache: vpsTabBackupStorageCache,
                    params: {
                        count: count,
                        offset: offset
                    }
                }).then(function (response) {
                    return response.data;
                });
            });
        };

        this.getBackupStorageAuthorizableBlocks = function () {
            return this.getSelected().then(function (vps) {
                return $http.get([aapiRootPath, vps.name, "backupStorage/access/authorizableBlocks"].join("/"), {serviceType: "aapi"})
                    .then(function (response) {
                        return response.data;
                    });
            });
        };

        this.postBackupStorageAccess = function (ipBlocksList, ftp, nfs, cifs) {
            return this.getSelected().then(function (vps) {
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

        this.putBackupStorageAccess = function (ipBlock, ftp, nfs, cifs) {
            return this.getSelected().then(function (vps) {
                return $http.put([swsVpsProxypass, vps.name, "backupftp", "access", encodeURIComponent(ipBlock)].join("/"), {
                    ftp: ftp,
                    nfs: nfs,
                    cifs: cifs
                }).then(function (response) {
                    return response.data;
                });
            });
        };

        this.deleteBackupStorageAccess = function (ipBlock) {
            return this.getSelected().then(function (vps) {
                return $http["delete"]([swsVpsProxypass, vps.name, "backupftp", "access", encodeURIComponent(ipBlock)].join("/"))
                    .then(function (response) {
                        return response.data;
                    });
            });
        };

        this.requestFtpBackupPassword = function () {
            return this.getSelected().then(function (vps) {
                return $http.post([swsVpsProxypass, vps.name, "backupftp/password"].join("/"))
                    .then(function (response) {
                        return response.data;
                    });
            });
        };

        this.getWindowsOptionDurations = function () {
            return this.getSelected().then(function (vps) {
                return $http.get([swsOrderProxypass, vps.name, "windows"].join("/"))
                    .then(function (response) {
                        return response.data;
                    });
            });
        };

        this.getWindowsOptionOrder = function (duration) {
            return this.getSelected().then(function (vps) {
                return $http.get([swsOrderProxypass, vps.name, "windows", duration].join("/"))
                    .then(function (response) {
                        return response.data;
                    });
            });
        };

        this.postWindowsOptionOrder = function (duration) {
            return this.getSelected().then(function (vps) {
                return $http.post([swsOrderProxypass, vps.name, "windows", duration].join("/"))
                    .then(function (response) {
                        return response.data;
                    });
            });
        };

        // Additional disks ------------------------------------------------------------------------------------
        this.hasAdditionalDiskOption = function () {
            return this.getSelected().then(function (vps) {
                if (!_.include(vps.availableOptions, "ADDITIONAL_DISK")) {
                    return $q.reject(additionalDiskHasNoOption);
                }
                return $http.get([swsOrderProxypass, vps.name].join("/")).then(function (response) {
                    if (_.include(response.data, "additionalDisk")) {
                        return response.data;
                    } else {
                        return $q.reject(additionalDiskHasNoOption);
                    }
                });
            });
        };

        this.getAdditionalDiskPrices = function () {
            return this.getSelected().then(function (vps) {
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

        this.getAllowedDuration = function (capacity) {
            return this.getSelected().then(function (vps) {
                var url = [swsOrderProxypass, vps.name, "additionalDisk"].join("/");
                return $http.get(url, { params: { additionalDiskSize: capacity } }).then(function (duration) {
                    return duration.data[0];
                });
            });
        };

        this.getAdditionalDiskFinalPrice = function (capacity, duration) {
            return this.getSelected().then(function (vps) {
                var url = [swsOrderProxypass, vps.name, "additionalDisk", duration].join("/");
                return $http.get(url, { params: { additionalDiskSize: capacity } }).then(function (response) {
                    return response.data;
                });
            });
        };

        this.postAdditionalDiskOrder = function (capacity, duration) {
            return this.getSelected().then(function (vps) {
                var url = [swsOrderProxypass, vps.name, "additionalDisk", duration].join("/");
                return $http.post(url, { additionalDiskSize: capacity }).then(function (response) {
                    return response.data;
                });
            });
        };

        this.getDisks = function () {
            return this.getSelected().then(function (vps) {
                return $http.get([swsVpsProxypass, vps.name, "disks"].join("/")).then(function (response) {
                    return response.data;
                });
            });
        };

        this.getDiskInfo = function (id) {
            return this.getSelected().then(function (vps) {
                return $http.get([swsVpsProxypass, vps.name, "disks", id].join("/")).then(function (response) {
                    return response.data;
                });
            });
        };

        this.showOnlyAdditionalDisk = function (disks) {
            _.remove(disks, function (currentObject) {
                return currentObject.type === "primary";
            });
            return disks;
        };

        // Service info
        this.getServiceInfos = function () {
            return this.getSelected().then(function (vps) {
                return $http.get([swsVpsProxypass, vps.name, "serviceInfos"].join("/")).then(function (response) {
                    return response.data;
                });
            });
        };

        this.isAutoRenewable = function () {
            return this.getSelected().then(function (vps) {
                return (moment(vps.expiration).diff(moment().date(), 'days') > 0);
            });
        };
    }
]);
