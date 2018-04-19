angular.module("managerApp")
    .controller("CdaDetailsHomeCtrl", function ($q, $state, $stateParams, $scope, $interval, $uibModal, $translate, OvhApiDedicatedCeph, CloudMessage, CdaService) {
        "use strict";

        var self = this;
        var taskPoll;

        self.pollingInterval = 10000;

        self.serviceName = $stateParams.serviceName;

        self.CdaService = CdaService;

        self.datas = {
            health: {},
            tasks: [],
            availableBytes: {},
            usedBytes: {},
            totalBytes: {},
            crushTunablesOptions: []
        };

        self.loading = false;

        self.modals = {
            edit: {
                templateUrl: "app/cda/details/home/detail/edit/cda-detail-edit.html",
                controller: "CdaDetailEditCtrl"
            }
        };

        function init () {
            self.loading = true;

            $q.allSettled([initHealth(), initCrushTunablesOptions()]).catch(function (errors) {
                displayError(_.find(errors, function (error) { return error; }));
            }).finally(function () {
                self.loading = false;
            });
            pollTaskList();
            initUsers();
        }

        function pollTaskList () {
            initTasks();
            taskPoll = $interval(function () {
                initTasks();
            }, self.pollingInterval);
        }

        function initHealth () {
            return OvhApiDedicatedCeph.v6().health({
                serviceName: self.serviceName
            }).$promise.then(function (health) {
                self.datas.health = health;
                self.datas.totalBytes = health.availableBytes;
                self.datas.availableBytes = health.availableBytes;
                self.datas.usedBytes = health.usedBytes;
                return health;
            });
        }

        function initCrushTunablesOptions () {
            return OvhApiDedicatedCeph.v6().schema({
                serviceName: self.serviceName
            }).$promise.then(function (schema) {
                self.datas.crushTunablesOptions = schema.models["dedicated.ceph.clusterUpdate.crushTunablesEnum"].enum;
            });
        }

        function initTasks () {
            OvhApiDedicatedCeph.Task().v6().resetQueryCache();
            OvhApiDedicatedCeph.Task().v6().query({
                serviceName: self.serviceName
            }).$promise.then(function (tasks) {
                //If we passed from a state with no tasks to a state with tasks or a state with tasks to a state with no tasks we update the details.
                if ((tasks.length === 0 && self.datas.tasks.length !== 0) || (tasks.length !== 0 && self.datas.tasks.length === 0)) {
                    CdaService.initDetails(self.serviceName, true);
                }

                self.datas.tasks = tasks;
            }).catch(function (error) {
                displayError(error);
            });
        }

        function displayError (error) {
            CloudMessage.error([$translate.instant("ceph_common_error"), error.data && error.data.message || ""].join(" "));
        }

        self.openEditModal = function () {
            openModal(self.modals.edit.templateUrl, self.modals.edit.controller, { details: self.CdaService.currentService, crushTunablesOptions: self.datas.crushTunablesOptions });
        };

        function openModal (template, controller, params) {
            $uibModal.open({
                windowTopClass: "cui-modal",
                templateUrl: template,
                controller: controller,
                controllerAs: controller,
                resolve: {
                    items: function () {
                        return params;
                    }
                }
            });
        }

        function initUsers () {
            return CdaService.getUsers($stateParams).then(function(users){
              self.datas.users = users;
              if (users.length === 0) {
                    var message = {
                        text: $translate.instant("cda_detail_info_no_user"),
                        link: {
                            type: "state",
                            text: $translate.instant("cda_detail_info_create_user"),
                            state: "paas.cda.cda-details.cda-user.cda-user-list"
                        }
                    };
                    CloudMessage.info(message);
              }
              return users;
            });
        }

        $scope.$on("$destroy", function () {
            $interval.cancel(taskPoll);
        });

        init();
    });
