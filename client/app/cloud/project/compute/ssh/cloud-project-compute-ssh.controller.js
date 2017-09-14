"use strict";

angular.module("managerApp")
  .controller("CloudProjectComputeSshCtrl", function (OvhApiCloudProjectSshKey, $scope, $translate, Toast, $stateParams, ovhDocUrl) {

    var self = this,
        serviceName = $stateParams.projectId;

    //Datas
    self.table = {
        ssh : [],
        sshKeysFilter: []
    };

    self.toggle = {
        openAddSsh  : false,
        sshDeleteId : null   //Curent sshkey to delete
    };

    self.order = {
        by      : 'name',
        reverse : false
    };

    //Loader during Datas requests
    self.loaders = {
        table : {
            ssh : false
        },
        add : {
            ssh : false
        },
        remove : {
            ssh : false
        }
    };

    var unsubscribeSearchEvent;

    //ssh model to add
    function initNewSshKey () {
        self.sshAdd = {
            serviceName : serviceName,
            name : null,
            publicKey  : null
        };
    }

    function init () {
        self.getSshKeys();
        initGuides();
        initNewSshKey();
        initSearchBar();

    }
    function initGuides () {
        self.guides = {
            create: ovhDocUrl.getDocUrl("g1769.creating_ssh_keys"),
            add: ovhDocUrl.getDocUrl("g1924.configuring_additionnal_ssh_key"),
            change: ovhDocUrl.getDocUrl("g2069.replacing_your_lost_ssh_key_pair")
        };
    }

    //---------SEARCH BAR---------

    function initSearchBar () {
        self.search = {
            name: null
        };

        if(!unsubscribeSearchEvent) {
            unsubscribeSearchEvent = $scope.$watch("CloudProjectComputeSshCtrl.search", function () {
                filterSshKeys();
            }, true);
        }
    }

    self.toggleSearchBar = function () {
        if (!self.search.open) {
            initSearchBar();
        }

        self.search.open = !self.search.open;
    };

    function isSshKeyMatchSearchCriterias(sshKey) {
        if (self.search.name && sshKey.name) {
            return sshKey.name.toLowerCase().indexOf(self.search.name.toLowerCase()) !== -1;
        }

        return true;
    }

    function filterSshKeys () {
        if ($scope.searchSshKeysForm && $scope.searchSshKeysForm.$valid) {
            var filteredKeys = self.table.ssh;
            if (self.search.open) {
                filteredKeys = _.filter(self.table.ssh, isSshKeyMatchSearchCriterias);
            }

            self.table.sshKeysFilter = filteredKeys;

            if (self.table.sshKeysFilter.length){
                self.orderBy();
            }
        }
    }

    //---------TOOLS---------

    self.toggleAddSshKey = function () {
        if (self.toggle.openAddSsh) {
            initNewSshKey();
        }
        self.toggle.openAddSsh = !self.toggle.openAddSsh;
    };

    //---------ORDER---------

    self.orderBy = function (by) {
        if (by) {
            if (self.order.by === by) {
                self.order.reverse = !self.order.reverse;
            } else {
                self.order.by = by;
            }
        }
    };

    self.selectSshKey = function(id, active){
        if (active) {
            setTimeout(function(){
                var areaheight=$('#sshkey_'+ id).prop('scrollHeight');
                $('#sshkey_'+ id).height(areaheight).select();
            }, 0);
        }
    };

    //---------SSH---------

    self.getSshKeys = function (clearCache) {
        if (!self.loaders.table.ssh) {
            self.toggle.sshDeleteId = null;
            self.loaders.table.ssh = true;
            if (clearCache) {
                OvhApiCloudProjectSshKey.Lexi().resetQueryCache();
            }
            OvhApiCloudProjectSshKey.Lexi().query({
                serviceName : serviceName
            }).$promise.then(function (sshList) {
                self.table.ssh = sshList;
                filterSshKeys();
            }, function (err){
                self.table.ssh = null;
                Toast.error( [$translate.instant('cpc_ssh_error'), err.data && err.data.message || ''].join(' '));
            })['finally'](function () {
                self.loaders.table.ssh = false;
            });
        }
    };

    self.postSshKey = function () {
        if (!self.loaders.add.ssh) {
            var uniq = _.find(self.table.ssh, function (sshkey) {
                return sshkey.name === self.sshAdd.name;
            });

            if (uniq) {
                Toast.error( $translate.instant('cpc_ssh_add_submit_name_error'));
                return;
            }

            self.loaders.add.ssh = true;
            OvhApiCloudProjectSshKey.Lexi().save(self.sshAdd).$promise.then(function () {
                self.toggleAddSshKey();
                self.getSshKeys(true);
                Toast.success($translate.instant('cpc_ssh_add_submit_success'));
            }, function (err){
                Toast.error( [$translate.instant('cpc_ssh_add_submit_error'), err.data && err.data.message || ''].join(' '));
            })['finally'](function () {
                self.loaders.add.ssh = false;
            });
        }
    };

    self.deleteSshKey = function (sshKey) {
        if (!self.loaders.remove.ssh) {
            self.loaders.remove.ssh = true;
            OvhApiCloudProjectSshKey.Lexi().remove({serviceName : serviceName, keyId: sshKey.id}).$promise.then(function () {
                self.getSshKeys(true);
                Toast.success($translate.instant('cpc_ssh_delete_success'));
            }, function (err){
                Toast.error( [$translate.instant('cpc_ssh_delete_error'), err.data && err.data.message || ''].join(' '));
            })['finally'](function () {
                self.loaders.remove.ssh = false;
            });
        }
    };

    init();

});
