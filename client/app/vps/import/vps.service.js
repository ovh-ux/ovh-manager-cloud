angular.module('managerApp').service('VpsService', [
  '$http',
  '$q',
  '$timeout',
  '$cacheFactory',
  '$rootScope',
  'additionalDisk.capacities',
  'additionalDisk.hasNoOption',
  'VpsTaskService',
  'ServiceHelper',
  '$translate',
  function VpsService($http, $q, $timeout, cache, $rootScope, additionalDiskCapacities,
    additionalDiskHasNoOption, VpsTaskService, ServiceHelper, $translate) {
    const aapiRootPath = '/sws/vps';


    const swsVpsProxypass = '/vps';


    const swsOrderProxypass = '/order/vps';


    const swsPriceProxypass = '/price/vps';


    const vpsCache = cache('UNIVERS_WEB_VPS');


    const vpsInfoCache = cache('VPS_INFO_CACHE');


    const vpsTabVeeamCache = cache('UNIVERS_WEB_VPS_TABS_VEEAM');


    const vpsTabBackupStorageCache = cache('UNIVERS_WEB_VPS_TABS_BACKUP_STORAGE');


    const requests = {
      vpsDetails: null,
    };


    const self = this;

    this.events = {
      tabVeeamChanged: 'vps.tabs.veeam.changed',
    };

    this.getTaskInProgress = function (serviceName, type) {
      let result = null;
      return this.getSelectedVps(serviceName).then((vps) => {
        if (vps && vps.name) {
          return $http.get([aapiRootPath, vps.name, 'tasks/uncompleted'].join('/'), {
            serviceType: 'aapi',
            params: {
              type,
            },
          }).then((data) => {
            result = data.data;
          });
        }
        return $q.reject(vps);
      }).then(() => result, http => $q.reject(http.data));
    };

    this.getTaskInError = function (serviceName) {
      let result = null;
      return this.getSelectedVps(serviceName).then((vps) => {
        if (vps && vps.name) {
          return $http.get([aapiRootPath, vps.name, 'tasks/error'].join('/'), { serviceType: 'aapi' }).then((data) => {
            result = data.data;
          });
        }
        return $q.reject(vps);
      }).then(() => result, http => $q.reject(http.data));
    };

    function resetTabVeeam() {
      vpsTabVeeamCache.removeAll();
      $rootScope.$broadcast(self.events.tabVeeamChanged);
    }

    /*
     * Private function to reset the cache
     *
     */
    function resetCache(key) {
      if (key !== undefined) {
        if (requests[key] !== undefined) {
          requests[key] = null;
        }
        vpsCache.remove(key);
      } else {
        vpsCache.removeAll();
        vpsInfoCache.removeAll();
        /* eslint-disable no-restricted-syntax, no-prototype-builtins */
        for (const request in requests) {
          if (requests.hasOwnProperty(request)) {
            requests[request] = null;
          }
        }
        /* eslint-enable no-restricted-syntax, no-prototype-builtins */
      }
    }

    /*
     * same as getSelected without using Products (it causes problem when changing vps
     * using sidebar)
     */
    this.getSelectedVps = function (serviceName) {
      return $http.get([aapiRootPath, serviceName, 'info'].join('/'), {
        serviceType: 'aapi',
        cache: vpsInfoCache,
      })
        .then((result) => {
          _.set(result, 'data.secondaryDns', (result.data.secondaryDns === 0)
            ? $translate.instant('vps_dashboard_secondary_dns_count_0')
            : $translate.instant('vps_dashboard_secondary_dns_count_x', {
              count: result.data.secondaryDns,
            }));
          return result.data;
        })
        .catch(ServiceHelper.errorHandler('vps_dashboard_loading_error'));
    };

    /*
         * Get monitoring data
         */
    this.getMonitoring = function (serviceName, period) {
      let monitoring = null;


      const p = period != null ? period : 'lastday';
      return this.getSelectedVps(serviceName).then((vps) => {
        if (vps && vps.name) {
          return $http.get([aapiRootPath, vps.name, 'monitoring'].join('/'), { serviceType: 'aapi', params: { period: p } })
            .then((data) => {
              if (data) {
                monitoring = data.data;
              } else {
                $q.reject(`${aapiRootPath + vps.name}/monitoring?period=${p} : No data`);
              }
            });
        }
        return $q.reject(vps);
      }).then(() => {
        if (monitoring !== null) {
          return monitoring;
        }
        return null;
      }).catch(ServiceHelper.errorHandler('vps_configuration_monitoring_fail'));
    };

    /*
         * reset VPS password
         */
    this.resetPassword = function (serviceName) {
      let result = null;
      return this.getSelectedVps(serviceName).then((vps) => {
        if (vps && vps.name) {
          return $http.post([swsVpsProxypass, vps.name, 'setPassword'].join('/'))
            .then((data) => {
              result = data.data;
            });
        }
        return $q.reject(vps);
      }).then(() => {
        VpsTaskService.initPoller(serviceName, 'iaas.vps.detail');
        return result;
      }, http => $q.reject(http.data));
    };

    /*
         * Reboot the VPS
         */
    this.reboot = function (serviceName, rescueMode) {
      let result = null;
      return this.getSelectedVps(serviceName).then((vps) => {
        if (vps && vps.name) {
          const netbootMode = rescueMode ? 'rescue' : 'local';
          if (vps.netbootMode === netbootMode.toUpperCase()) {
            return $http.post([swsVpsProxypass, vps.name, 'reboot'].join('/'))
              .then((data) => {
                result = data.data;
              });
          }

          // The modification of netbootMode for a vps other than CLOUD 2014v1 model will make
          // the VPS reboot. So ask an explicit reboot only if the VPS is a CLOUD 2014v1
          if ((vps.offerType === 'CLOUD' && vps.version === '_2014_V_1')) {
            // Sleep for 40 seconds because the netboot change take some seconds to apply.
            // It's not a good solution, it's like that since the begin
            return $http.put([swsVpsProxypass, vps.name].join('/'), { netbootMode })
              .then(() => $timeout(() => $http.post([swsVpsProxypass, vps.name, 'reboot'].join('/')).then((data) => {
                result = data.data;
              }), 40000));
          }
          return $http.put([swsVpsProxypass, vps.name].join('/'), { netbootMode });
        }
        return $q.reject(vps);
      }).then(() => {
        resetCache();
        VpsTaskService.initPoller(serviceName, 'iaas.vps.detail');
        return result;
      }, http => $q.reject(http.data));
    };

    /*
         * Get a KVM access for the VPS
         */
    this.getKVMAccess = function (serviceName) {
      return $http.post([swsVpsProxypass, serviceName, 'openConsoleAccess'].join('/'), { protocol: 'VNCOverWebSocket' })
        .then(data => data.data)
        .catch(ServiceHelper.errorHandler());
    };

    this.getKVMConsoleUrl = function (serviceName) {
      let result = null;
      return $http.post([swsVpsProxypass, serviceName, 'getConsoleUrl'].join('/')).then((response) => {
        result = response.data;
      },
      err => $q.reject(err.data)).then(() => {
        resetCache();
        $rootScope.$broadcast('vps.dashboard.refresh');
        return result;
      }, http => $q.reject(http.data));
    };

    /*
         * return the templates list available for this VPS
         */
    this.getTemplates = function (serviceName) {
      return $http.get([aapiRootPath, serviceName, 'templates'].join('/'), { serviceType: 'aapi' })
        .then(response => response.data)
        .catch(ServiceHelper.errorHandler('vps_configuration_polling_fail'));
    };

    /*
         * Reinstall the VPS using the template identified by templateId
         */
    this.reinstall = function (serviceName, templateId, language, softIds, sshKeys,
      doNotSendPassword) {
      if (!templateId) {
        return $q.reject('No templateId');
      }
      return $http.post([swsVpsProxypass, serviceName, 'reinstall'].join('/'), {
        language,
        softwareId: softIds,
        sshKey: sshKeys,
        doNotSendPassword: Boolean(doNotSendPassword),
        templateId,
      })
        .then((response) => {
          resetCache();
          VpsTaskService.initPoller(serviceName, 'iaas.vps.detail');
          return response.data;
        })
        .catch(ServiceHelper.errorHandler('vps_configuration_reinstall_fail'))
        .finally(() => this.CucCloudMessage.success(this.$translate.instant('vps_configuration_reinstall_success', { serviceName: this.serviceName })));
    };

    /*
         * return the ip list for this VPS
         */
    this.getIps = function (serviceName) {
      return $http.get([aapiRootPath, serviceName, 'ips'].join('/'), { serviceType: 'aapi' })
        .then(data => data.data)
        .catch(ServiceHelper.errorHandler());
    };

    /*
         * Reinstall the VPS using the template identified by templateId
         */
    this.setReversesDns = function (serviceName, ips) {
      let result = null;
      return this.getSelectedVps(serviceName).then((vps) => {
        if (!ips) {
          return $q.reject('No ips');
        } if (vps && vps.name) {
          return $http.post([aapiRootPath, vps.name, 'ips', 'reverse'].join('/'), ips, { serviceType: 'aapi' })
            .then((data) => { result = data.data; });
        }
        return $q.reject(vps);
      }).then(() => {
        resetCache();
        $rootScope.$broadcast('vps.dashboard.refresh');
        return result;
      }, http => $q.reject(http.data));
    };

    /*
         * Get content of summary tabs
         */
    this.getTabSummary = function (serviceName, forceRefresh) {
      let vpsName = null;
      return this.getSelectedVps(serviceName).then((vps) => {
        if (vps && vps.name && !vps.isExpired) {
          vpsName = vps.name;
          if (forceRefresh) {
            resetCache(`tabSummary_${vpsName}`);
          }
          const tabSummary = vpsCache.get(`tabSummary_${vpsName}`);
          if (!tabSummary) {
            vpsCache.put(`tabSummary_${vps.name}`, true);
            return $http.get([aapiRootPath, vps.name, 'tabsummary'].join('/'), { serviceType: 'aapi' })
              .then((response) => {
                if (response.status < 300) {
                  vpsCache.put(`tabSummary_${vpsName}`, response.data);
                  return vpsCache.get(`tabSummary_${vpsName}`);
                }
                return $q.reject(response);
              });
          }
          return tabSummary;
        }
        return $q.reject(vps);
      }).then(() => {
        const result = vpsCache.get(`tabSummary_${vpsName}`);
        if (result && (!result.messages
          || (angular.isArray(result.messages) && result.messages.length === 0))) {
          return result;
        } if (result && result.messages.length !== 0) {
          return $q.reject(result.messages);
        }
        return $q.reject(result);
      }).catch(ServiceHelper.errorHandler('vps_dashboard_loading_error'));
    };

    /*
         * Get content of ips tabs
         */
    this.getTabIps = function (serviceName) {
      let vpsName = null;
      return this.getSelectedVps(serviceName).then((vps) => {
        if (vps && vps.name) {
          vpsName = vps.name;
          const tabSummary = vpsCache.get(`tabIps_${vpsName}`);
          if (!tabSummary) {
            vpsCache.put(`tabIps_${vps.name}`, true);
            return $http.get([aapiRootPath, vps.name, 'tabips'].join('/'), { serviceType: 'aapi' })
              .then((response) => {
                if (response.status < 300) {
                  vpsCache.put(`tabIps_${vpsName}`, response.data);
                  return vpsCache.get(`tabIps_${vpsName}`);
                }
                return $q.reject(response);
              });
          }
          return tabSummary;
        }
        return $q.reject(vps);
      }).then(() => {
        const result = vpsCache.get(`tabIps_${vpsName}`);
        if (result && (!result.messages
          || (angular.isArray(result.messages) && result.messages.length === 0))) {
          return result;
        } if (result && result.messages.length !== 0) {
          return $q.reject(result.messages);
        }
        return $q.reject(result);
      }, (reason) => {
        if (reason && reason.data !== undefined) {
          return $q.reject(reason.data);
        }
        return $q.reject(reason);
      });
    };

    /*
         * Get content of secondary DNS tab
         */
    this.getTabSecondaryDns = function (serviceName, count, offset) {
      let vpsName = null;


      let offsetFinal = offset;


      let countFinal = count;


      let cacheKey = null;
      return this.getSelectedVps(serviceName).then((vps) => {
        if (vps && vps.name) {
          vpsName = vps.name;
          if (!count) {
            countFinal = 0;
          }
          if (!offset) {
            offsetFinal = 0;
          }
          cacheKey = `tabSecondaryDNS_${vpsName}_count=${countFinal}_offset=${offsetFinal}`;
          const tabSummary = vpsCache.get(cacheKey);
          if (!tabSummary) {
            vpsCache.put(cacheKey, true);
            return $http.get([aapiRootPath, vps.name, 'tabsecondarydns'].join('/'), { serviceType: 'aapi' })
              .then((response) => {
                if (response.status < 300) {
                  vpsCache.put(cacheKey, response.data);
                  return vpsCache.get(cacheKey);
                }
                return $q.reject(response);
              });
          }
          return tabSummary;
        }
        return $q.reject(vps);
      }).then(() => {
        const result = vpsCache.get(cacheKey);
        if (result && (!result.messages
          || (angular.isArray(result.messages) && result.messages.length === 0))) {
          return result;
        } if (result && result.messages.length !== 0) {
          return $q.reject(result.messages);
        }
        return $q.reject(result);
      }, (reason) => {
        if (reason && reason.data !== undefined) {
          return $q.reject(reason.data);
        }
        return $q.reject(reason);
      });
    };

    /*
         * Get the secondary DNS available for this VPS
         */
    this.getSecondaryDNSAvailable = function (serviceName) {
      return this.getSelectedVps(serviceName).then((vps) => {
        if (vps && vps.name) {
          const tabSummary = vpsCache.get('tabSecondaryDNS_dns_available');
          if (!tabSummary) {
            vpsCache.put('tabSecondaryDNS_dns_available', true);
            return $http.get([swsVpsProxypass, vps.name, 'secondaryDnsNameServerAvailable'].join('/'))
              .then((response) => {
                if (response.status < 300) {
                  vpsCache.put('tabSecondaryDNS_dns_available', response.data);
                  return vpsCache.get('tabSecondaryDNS_dns_available');
                }
                return $q.reject(response);
              });
          }
          return tabSummary;
        }
        return $q.reject(vps);
      }).then(() => {
        const result = vpsCache.get('tabSecondaryDNS_dns_available');
        if (result && (!result.messages
          || (angular.isArray(result.messages) && result.messages.length === 0))) {
          return result;
        } if (result && result.messages.length !== 0) {
          return $q.reject(result.messages);
        }
        return $q.reject(result);
      }, (reason) => {
        if (reason && reason.data !== undefined) {
          return $q.reject(reason.data);
        }
        return $q.reject(reason);
      });
    };

    /*
         * Add a domain to the secondary DNS for the VPS
         *
         */
    this.addSecondaryDnsDomain = function (serviceName, domain) {
      let result = null;
      return this.getSelectedVps(serviceName).then((vps) => {
        if (vps && vps.name) {
          return $http.post([swsVpsProxypass, vps.name, 'secondaryDnsDomains'].join('/'), { domain })
            .then((data) => {
              result = data.data;
            });
        }
        return $q.reject(vps);
      }).then(() => {
        resetCache();
        $rootScope.$broadcast('vps.tabs.secondarydns.refresh');
        $rootScope.$broadcast('vps.dashboard.vpsonly.refresh');
        return result;
      }, (reason) => {
        if (reason && reason.data !== undefined) {
          return $q.reject(reason.data);
        }
        return $q.reject(reason);
      });
    };

    /*
         * delete the domain from secondary DNS
         */
    this.deleteSecondaryDnsDomain = function (serviceName, domain) {
      let result = null;
      return this.getSelectedVps(serviceName).then((vps) => {
        if (vps && vps.name && domain) {
          return $http.delete([swsVpsProxypass, vps.name, 'secondaryDnsDomains', domain].join('/'))
            .then((data) => {
              result = data.data;
            });
        }
        return $q.reject(vps);
      }).then(() => {
        resetCache();
        $rootScope.$broadcast('vps.tabs.secondarydns.refresh');
        $rootScope.$broadcast('vps.dashboard.vpsonly.refresh');
        return result;
      }, (reason) => {
        if (reason && reason.data !== undefined) {
          return $q.reject(reason.data);
        }
        return $q.reject(reason);
      });
    };

    /*
         * create a snapshot for the VPS
         */
    this.takeSnapshot = function (serviceName, description) {
      let result = null; let
        vpsName = null;
      return this.getSelectedVps(serviceName).then((vps) => {
        if (vps && vps.name) {
          vpsName = vps.name;
          return $http.post([swsVpsProxypass, vps.name, 'createSnapshot'].join('/'), description)
            .then((data) => {
              result = data.data;
            });
        }
        return $q.reject(vps);
      }).then(() => {
        resetCache(`tabSummary_${vpsName}`);
        VpsTaskService.initPoller(serviceName, 'iaas.vps.detail');
        return result;
      }, (reason) => {
        if (reason && reason.data !== undefined) {
          return $q.reject(reason.data);
        }
        return $q.reject(reason);
      });
    };

    /*
         * restore a snapshot for the VPS
         */
    this.restoreSnapshot = function (serviceName) {
      let result = null;
      return this.getSelectedVps(serviceName).then((vps) => {
        if (vps && vps.name) {
          return $http.post([swsVpsProxypass, vps.name, 'snapshot/revert'].join('/'))
            .then((data) => {
              result = data.data;
            });
        }
        return $q.reject(vps);
      }).then(() => {
        resetCache();
        VpsTaskService.initPoller(serviceName, 'iaas.vps.detail');
        return result;
      }, (reason) => {
        if (reason && reason.data !== undefined) {
          return $q.reject(reason.data);
        }
        return $q.reject(reason);
      });
    };

    /*
         * delete the snapshot for the VPS
         */
    this.deleteSnapshot = function (serviceName) {
      let result = null; let
        vpsName = null;
      return this.getSelectedVps(serviceName).then((vps) => {
        if (vps && vps.name) {
          vpsName = vps.name;
          return $http.delete([swsVpsProxypass, vps.name, 'snapshot'].join('/'))
            .then((data) => {
              result = data.data;
            });
        }
        return $q.reject(vps);
      }).then(() => {
        resetCache(`tabSummary_${vpsName}`);
        VpsTaskService.initPoller(serviceName, 'iaas.vps.detail');
        return result;
      }, (reason) => {
        if (reason && reason.data !== undefined) {
          return $q.reject(reason.data);
        }
        return $q.reject(reason);
      });
    };

    /*
         * order an option for the VPS
         */
    this.orderOption = function (serviceName, option, duration) {
      let result = null; let
        vpsName = null;
      return this.getSelectedVps(serviceName).then((vps) => {
        if (vps && vps.name && option && duration) {
          vpsName = vps.name;
          return $http.post([aapiRootPath, vps.name, 'order', 'options'].join('/'), { option, duration }, { serviceType: 'aapi' })
            .then((data) => {
              result = data.data;
            });
        }
        return $q.reject(vps);
      }).then(() => {
        resetCache(`tabSummary_${vpsName}`);
        return result;
      }, (reason) => {
        if (reason && reason.data !== undefined) {
          return $q.reject(reason.data);
        }
        return $q.reject(reason);
      });
    };

    /*
         * get details for an option for the VPS
         */
    this.getOptionDetails = function (serviceName, option) {
      let result = null;
      return this.getSelectedVps(serviceName).then((vps) => {
        if (vps && vps.name && option) {
          return $http.get([aapiRootPath, vps.name, 'options', option].join('/'), { serviceType: 'aapi' })
            .then((data) => {
              result = data.data;
            });
        }
        return $q.reject(vps);
      }).then(() => result, (reason) => {
        if (reason && reason.data !== undefined) {
          return $q.reject(reason.data);
        }
        return $q.reject(reason);
      });
    };

    this.getOptionSnapshotFormated = function (serviceName) {
      return this.getOptionDetails(serviceName, 'snapshot').then(optionDetails => _.first(optionDetails.results));
    };

    this.getPriceOptions = function (vps) {
      return $http.get(['/price/vps', vps.version.toLowerCase().replace(/_/g, ''), vps.offerType.toLowerCase(), 'option/automatedBackup'].join('/'));
    };

    this.cancelOption = function (serviceName, option) {
      return this.getSelectedVps(serviceName).then(vps => $http.delete([swsVpsProxypass, vps.name, 'option', option].join('/'))
        .catch(err => (err && err.data ? $q.reject(err.data) : $q.reject(err))));
    };

    this.getOptionStatus = function (serviceName, option) {
      return this.getSelectedVps(serviceName).then(vps => $http.get([swsVpsProxypass, vps.name, 'option', option].join('/'))
        .then(response => response.data));
    };

    /*
         * upgrade the VPS tothe specified model
         */
    this.upgrade = function (serviceName, model, duration) {
      let result = null;
      return this.getSelectedVps(serviceName).then((vps) => {
        if (vps && vps.name && model && duration) {
          return $http.post([swsOrderProxypass, vps.name, 'upgrade', duration].join('/'), { model })
            .then((data) => {
              result = data.data;
            });
        }
        return $q.reject(vps);
      }).then(() => {
        resetCache();
        return result;
      }, (reason) => {
        if (reason && reason.data !== undefined) {
          return $q.reject(reason.data);
        }
        return $q.reject(reason);
      });
    };

    /*
         * get details for an option for the VPS
         */
    this.upgradesList = function (serviceName) {
      let result = null;
      return this.getSelectedVps(serviceName).then((vps) => {
        if (vps && vps.name) {
          return $http.get([aapiRootPath, vps.name, 'upgrade'].join('/'), { serviceType: 'aapi' })
            .then((data) => {
              result = data.data;
            });
        }
        return $q.reject(vps);
      }).then(() => result, (reason) => {
        if (reason && reason.data !== undefined) {
          return $q.reject(reason.data);
        }
        return $q.reject(reason);
      });
    };

    /*
         * Get content of veeam tab
         */
    this.getVeeamInfo = function (serviceName) {
      return $http.get([swsVpsProxypass, serviceName, 'automatedBackup'].join('/'))
        .then(response => response.data);
    };

    this.getVeeamAttachedBackup = function (serviceName) {
      return $http.get([swsVpsProxypass, serviceName, 'automatedBackup/attachedBackup'].join('/'))
        .then(response => response.data);
    };

    this.getVeeam = function (serviceName) {
      let info;
      return $q.all([self.getVeeamInfo(serviceName), self.getVeeamAttachedBackup(serviceName)])
        .then((response) => {
          if (response.length > 1) {
            info = _.first(response);
            info.accessInfos = _.first(response[1]);
          }
          return info;
        })
        .catch(() => ({ state: 'disabled' }));
    };

    this.getTabVeeam = function (serviceName, state, forceRefresh) {
      if (forceRefresh) {
        resetTabVeeam();
      }
      return $http.get([swsVpsProxypass, serviceName, 'automatedBackup/restorePoints'].join('/'), {
        params: {
          state,
        },
        cache: vpsTabVeeamCache,
      }).then(response => response.data);
    };

    this.veeamRestorePointMount = function (serviceName, restorePoint) {
      return this.getSelectedVps(serviceName).then(vps => $http.post([swsVpsProxypass, vps.name, 'automatedBackup/restore'].join('/'), {
        changePassword: false,
        restorePoint,
        type: 'file',
      }).then((response) => {
        resetTabVeeam();
        VpsTaskService.initPoller(serviceName, 'iaas.vps.detail');
        return response.data;
      }));
    };

    this.veeamRestorePointRestore = function (serviceName, restorePoint, changePassword) {
      return this.getSelectedVps(serviceName).then(vps => $http.post([swsVpsProxypass, vps.name, 'automatedBackup/restore'].join('/'), {
        changePassword,
        restorePoint,
        type: 'full',
      }).then((response) => {
        resetTabVeeam();
        VpsTaskService.initPoller(serviceName, 'iaas.vps.detail');
        return response.data;
      }));
    };

    this.veeamRestorePointUmount = function (serviceName, restorePoint) {
      return this.getSelectedVps(serviceName).then(vps => $http.post([swsVpsProxypass, vps.name, 'automatedBackup/detachBackup'].join('/'), {
        restorePoint,
      }).then((response) => {
        resetTabVeeam();
        VpsTaskService.initPoller(serviceName, 'iaas.vps.detail');
        return response.data;
      }));
    };

    /**
         * Get option veeam
         */
    this.getVeeamOption = function (serviceName) {
      return this.getSelectedVps(serviceName).then(vps => $http.get([aapiRootPath, vps.name, 'automatedBackup'].join('/'), {
        serviceType: 'aapi',
        cache: vpsCache,
      }).then(response => response.data).catch(error => error.data));
    };

    /**
         * Order the option veeam
         */
    this.orderVeeamOption = (serviceName, duration) => this.getSelectedVps(serviceName)
      .then(vps => $http.post([swsOrderProxypass, vps.name, 'automatedBackup', duration].join('/'), {}))
      .then(response => response.data);
    /**
         * Update the VPS
         */
    this.update = function (serviceName, newValue) {
      return this.getSelectedVps(serviceName).then(vps => $http.put([swsVpsProxypass, vps.name].join('/'), newValue)
        .then((response) => {
          resetCache();
          VpsTaskService.initPoller(serviceName, 'iaas.vps.detail');
          return response.data;
        }));
    };

    /**
         * Update the VPS display name
         */
    this.updateDisplayName = function (serviceName, displayName) {
      return $http.put([swsVpsProxypass, serviceName].join('/'), { displayName })
        .then((response) => {
          resetCache();
          $rootScope.$broadcast('global_display_name_change', {
            serviceName,
            displayName,
          });
          return response.data;
        });
    };

    // BackupStorage

    this.getBackupStorageInformation = function (serviceName) {
      return $http.get([aapiRootPath, serviceName, 'backupStorage'].join('/'), { serviceType: 'aapi' })
        .then((response) => {
          const backupInfo = response.data;
          if (backupInfo.activated === true && backupInfo.quota) {
            if (backupInfo.usage === 0) {
              backupInfo.usage = {
                unit: '%',
                value: 0,
              };
            }
          }
          return backupInfo;
        })
        .catch(ServiceHelper.errorHandler());
    };

    this.getBackupStorageTab = function (serviceName, count, offset) {
      vpsTabBackupStorageCache.removeAll();
      return $http.get([aapiRootPath, serviceName, 'backupStorage/access'].join('/'), {
        serviceType: 'aapi',
        cache: vpsTabBackupStorageCache,
        params: {
          count,
          offset,
        },
      })
        .then(response => response.data);
    };

    this.getBackupStorageAuthorizableBlocks = function (serviceName) {
      return this.getSelectedVps(serviceName).then(vps => $http.get([aapiRootPath, vps.name, 'backupStorage/access/authorizableBlocks'].join('/'), { serviceType: 'aapi' })
        .then(response => response.data));
    };

    this.postBackupStorageAccess = function (serviceName, ipBlocksList, ftp, nfs, cifs) {
      return this.getSelectedVps(serviceName).then(vps => $http.post([aapiRootPath, vps.name, 'backupStorage/access/add'].join('/'), {
        ipBlocksList,
        ftp,
        nfs,
        cifs,
      }, { serviceType: 'aapi' }).then(response => response.data));
    };

    this.putBackupStorageAccess = function (serviceName, ipBlock, ftp, nfs, cifs) {
      return this.getSelectedVps(serviceName).then(vps => $http.put([swsVpsProxypass, vps.name, 'backupftp', 'access', encodeURIComponent(ipBlock)].join('/'), {
        ftp,
        nfs,
        cifs,
      }).then(response => response.data));
    };

    this.deleteBackupStorageAccess = function (serviceName, ipBlock) {
      return this.getSelectedVps(serviceName).then(vps => $http.delete([swsVpsProxypass, vps.name, 'backupftp', 'access', encodeURIComponent(ipBlock)].join('/'))
        .then(response => response.data));
    };

    this.requestFtpBackupPassword = function (serviceName) {
      return this.getSelectedVps(serviceName).then(vps => $http.post([swsVpsProxypass, vps.name, 'backupftp/password'].join('/'))
        .then(response => response.data));
    };

    this.getWindowsOptionDurations = function (serviceName) {
      return this.getSelectedVps(serviceName).then(vps => $http.get([swsOrderProxypass, vps.name, 'windows'].join('/'))
        .then(response => response.data));
    };

    this.getWindowsOptionOrder = function (serviceName, duration) {
      return this.getSelectedVps(serviceName).then(vps => $http.get([swsOrderProxypass, vps.name, 'windows', duration].join('/'))
        .then(response => response.data));
    };

    this.postWindowsOptionOrder = function (serviceName, duration) {
      return this.getSelectedVps(serviceName).then(vps => $http.post([swsOrderProxypass, vps.name, 'windows', duration].join('/'))
        .then(response => response.data));
    };

    // Additional disks
    this.hasAdditionalDiskOption = serviceName => this.getSelectedVps(serviceName).then((vps) => {
      if (!_.include(vps.availableOptions, 'ADDITIONAL_DISK')) {
        return $q.reject(additionalDiskHasNoOption);
      }
      return this.canOrderOption(serviceName, 'additionalDisk');
    });

    this.canOrderOption = (serviceName, optionName) => $http.get([swsOrderProxypass, serviceName].join('/')).then((response) => {
      if (_.include(response.data, optionName)) {
        return response.data;
      }
      return $q.reject(additionalDiskHasNoOption);
    });

    this.getAdditionalDiskPrices = function getAdditionalDiskPrices(serviceName) {
      return this.getSelectedVps(serviceName).then(vps => $q.all([
        $http.get([swsPriceProxypass, '2015v1', vps.offerType.toLowerCase(), 'option', additionalDiskCapacities[0].option].join('/')),
        $http.get([swsPriceProxypass, '2015v1', vps.offerType.toLowerCase(), 'option', additionalDiskCapacities[1].option].join('/')),
        $http.get([swsPriceProxypass, '2015v1', vps.offerType.toLowerCase(), 'option', additionalDiskCapacities[2].option].join('/')),
        $http.get([swsPriceProxypass, '2015v1', vps.offerType.toLowerCase(), 'option', additionalDiskCapacities[3].option].join('/')),
      ]).then((responses) => {
        const prices = [];
        let i = 0;
        angular.forEach(responses, (capacity) => {
          _.set(capacity, 'data.type', additionalDiskCapacities[i].option);
          _.set(capacity, 'data.size', additionalDiskCapacities[i].size);
          i += 1;
          prices.push(capacity.data);
        });
        return prices;
      }));
    };

    this.getAllowedDuration = function (serviceName, capacity) {
      return this.getSelectedVps(serviceName).then((vps) => {
        const url = [swsOrderProxypass, vps.name, 'additionalDisk'].join('/');
        return $http
          .get(url, { params: { additionalDiskSize: capacity } })
          .then(duration => duration.data[0]);
      });
    };

    this.getAdditionalDiskFinalPrice = function (serviceName, capacity, duration) {
      return this.getSelectedVps(serviceName).then((vps) => {
        const url = [swsOrderProxypass, vps.name, 'additionalDisk', duration].join('/');
        return $http
          .get(url, { params: { additionalDiskSize: capacity } })
          .then(response => response.data);
      });
    };

    this.postAdditionalDiskOrder = function (serviceName, capacity, duration) {
      return this.getSelectedVps(serviceName).then((vps) => {
        const url = [swsOrderProxypass, vps.name, 'additionalDisk', duration].join('/');
        return $http.post(url, { additionalDiskSize: capacity }).then(response => response.data);
      });
    };

    this.getDisks = function (serviceName) {
      return $http.get([swsVpsProxypass, serviceName, 'disks'].join('/'))
        .then(response => response.data)
        .catch(ServiceHelper.errorHandler('vps_dashboard_loading_error'));
    };

    this.getDiskInfo = function (serviceName, id) {
      return $http.get([swsVpsProxypass, serviceName, 'disks', id].join('/'))
        .then(response => response.data)
        .catch(ServiceHelper.errorHandler('vps_dashboard_loading_error'));
    };

    this.showOnlyAdditionalDisk = function (disks) {
      _.remove(disks, currentObject => currentObject.type === 'primary');
      return disks;
    };

    // Service info
    this.getServiceInfos = function (serviceName) {
      return this.getSelectedVps(serviceName).then(vps => $http.get([swsVpsProxypass, serviceName, 'serviceInfos'].join('/'))
        .then((response) => {
          response.data.offer = vps.model;
          return response.data;
        })
        .catch(ServiceHelper.errorHandler('vps_dashboard_loading_error')));
    };

    this.isAutoRenewable = function (serviceName) {
      return this.getSelectedVps(serviceName).then(vps => (moment(vps.expiration).diff(moment().date(), 'days') > 0));
    };
  },
]);
