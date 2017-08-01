"use strict";

angular.module("managerApp")
  .controller("IpDropdownComponentCtrl", function ($translate, $window, REDIRECT_URLS, Ip, Toast, CLOUD_GEOLOCALISATION) {
      var self = this;

      self.failoverAttach = function (ip) {
          self.onFailoverAttach({ ip: ip });
      };

      var ipActionUrlWithSession = REDIRECT_URLS.ipAction;
      self.ipActionRedirections = {
          firewall:  ipActionUrlWithSession.replace("{action}", "firewall"),
          mitigation:  ipActionUrlWithSession.replace("{action}", "mitigation"),
          reverse:  ipActionUrlWithSession.replace("{action}", "reverse")
      };

      self.ipActionRedirect = function (action, ip) {
          var url = null;
          var ipActionUrlWithSession = REDIRECT_URLS.ipAction;
          switch (action) {
              case "reverse":
                  if (self.isIpUserSameContinent(ip)) {
                      Ip.Lexi().resetCache();
                      url = ipActionUrlWithSession.replace("{action}", "reverse").replace("{ipBlock}", window.encodeURIComponent(ip.block || ip[self.ipAccessKey])).replace("{ip}", ip[self.ipAccessKey]);
                  } else {
                      Toast.info($translate.instant("cpci_ip_reverse_info_soon"));
                  }
                  break;
              default:
                  url = ipActionUrlWithSession.replace("{action}", action).replace("{ipBlock}", window.encodeURIComponent(ip.block || ip[self.ipAccessKey])).replace("{ip}", ip[self.ipAccessKey]);
          }
          if (url) {
              $window.open(url);
          }
      };

      self.isIpUserSameContinent = function (ip) {
          var userContinent = self.getUserContinent();
          var ipContinent = self.getIpContinent(ip);
          return userContinent && ipContinent && userContinent === ipContinent;
      };

      self.getUserContinent = function () {
          var continent = null;
          if (self.user) {
              continent = _.first(_.keys(_.pick(CLOUD_GEOLOCALISATION.user, function (region) {
                  return _.indexOf(region, self.user.ovhSubsidiary) >= 0;
              })));
          }
          return continent;
      };

      self.getIpContinent = function (ip) {
          var continent = null;
          switch (ip.type) {
              case "failover":
                  continent = ip.continentCode;
                  break;
              case "public":
                  // in case of public IP we get the location from the linked vm
                  var linkedVmId = _.first(ip.routedTo);
                  if (linkedVmId) {
                      var linkedVm = self.infra.vrack.publicCloud.get(linkedVmId);
                      if (linkedVm) {
                          continent = _.first(_.keys(_.pick(CLOUD_GEOLOCALISATION.instance, function (region) {
                              return _.indexOf(region, linkedVm.region) >= 0;
                          })));
                      }
                  }
                  break;
              default:
                  // unknown type of IP
                  break;
          }
          return continent;
      };
  });