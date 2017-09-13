angular.module("managerApp")
  .controller("CdaDetailsHomeCtrl", function ($q, $state, $stateParams, $scope, $interval, $uibModal, $translate, OvhApiDedicatedCeph, Toast, CdaService) {
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
          return OvhApiDedicatedCeph.Lexi().health({
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
          return OvhApiDedicatedCeph.Lexi().schema({
              serviceName: self.serviceName
          }).$promise.then(function (schema) {
              self.datas.crushTunablesOptions = schema.models["dedicated.ceph.clusterUpdate.crushTunablesEnum"].enum;
          });
      }

      function initTasks () {
          OvhApiDedicatedCeph.Task().Lexi().resetQueryCache();
          OvhApiDedicatedCeph.Task().Lexi().query({
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
          Toast.error([$translate.instant("ceph_common_error"), error.data && error.data.message || ""].join(" "));
      }

      self.openEditModal = function () {
          openModal(self.modals.edit.templateUrl, self.modals.edit.controller, { details: self.CdaService.currentService, crushTunablesOptions: self.datas.crushTunablesOptions });
      };

      function openModal (template, controller, params) {
          $uibModal.open({
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
            return users;
          });
      }

      $scope.$on("$destroy", function () {
          $interval.cancel(taskPoll);
      });

      init();
  });
