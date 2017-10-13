"use strict";

angular.module("managerApp")
.controller("CloudProjectOpenstackUsersCtrl",
    function (OvhApiCloud, $translate, CloudMessage, $stateParams, Poller, $scope, OpenstackUsersPassword, OpenstackUsersToken,
              $filter, $q, ControllerHelper, $window, REDIRECT_URLS, CloudProjectRightService) {

        var self = this;
        var orderBy = $filter("orderBy");
        var pollingInterval = 5000;

        self.projectId = $stateParams.projectId;

        self.table = {
            users: {},
            selectableUsers: [],
            selectableUsersCurrentPage: [],
            selected: {},
            autoSelected: {}
        };

        self.toggle = {
            openAddUser: false,
            userGenerateTokenId: null,
        };

        self.order = {
            by: "username",
            reverse: false
        };

        self.loaders = {
            table: {
                user: false
            },
            add: {
                user: false,
                token: false
            },
            remove: {
                user: false,
                userMulti: false
            },
            regeneratePassword: false,
            generateToken: false
        };

        self.generateToken = {
            pass: null
        };

        // user model to add
        function initNewUser () {
            self.userAdd = {
                serviceName: self.projectId,
                description: null
            };
        }

        function init () {
            self.getUsers();
            initNewUser();
        }

        //---------TOOLS---------
        self.toggleAddUser = function () {
            if (self.toggle.openAddUser) {
                initNewUser();
            }
            self.toggle.openAddUser = !self.toggle.openAddUser;
        };

        self.getSelectedCount = function () {
            return Object.keys(self.table.selected).length;
        };

        $scope.$watch("CloudProjectOpenstackUsersCtrl.table.selected", function () {

            //if some line were not removed => recheck or if polling happened.
            if (!_.isEmpty(self.table.autoSelected)) {

                //Selected (and autoselected) are represented as object : Not array of objects or array of arrays.
                //Therefore, we have to loop through the keys (which represent a UserId) and then compare it to the
                //userId in the user object.  User.id is a number and userId a string (it is an object key) so
                //the .ToString is mandatory in order to use === instead of ==.
                _.forEach(_.keys(self.table.autoSelected), function (userId) {
                    var isInUserTable = _.some(self.table.users, function (user) {
                        return user.id.toString() === userId;
                    });
                    if (isInUserTable) {
                        self.table.selected[userId] = true;
                    }
                });
                self.table.autoSelected = [];
            }
        }, true);

        $scope.$watch("CloudProjectComputeSnapshotCtrl.table.usersCurrentPage", function (users) {
            self.table.selectableUsersCurrentPage = getSelectableUserList(users);
        });

        //---------ORDER---------

        self.orderBy = function (by) {
            if (by) {
                if (self.order.by === by) {
                    self.order.reverse = !self.order.reverse;
                }else {
                    self.order.by = by;
                }
            }
            self.table.users = orderBy(self.table.users, self.order.by, self.order.reverse);
            self.table.selectableUsers = orderBy(self.table.selectableUsers, self.order.by, self.order.reverse);
        };

        self.selectUser = function (id, active) {
            if (active) {
                setTimeout(function () {
                    var areaheight = $("#user_" + id).prop("scrollHeight");
                    $("#user_" + id).height(areaheight).select();
                }, 0);
            }
        };

        self.getUsers = function () {
            if (!self.loaders.table.user) {
                self.table.users = [];
                self.loaders.table.user = true;

                return Poller.poll(
                    "/cloud/project/" + self.projectId + "/user",
                    null,
                    {
                        namespace: "cloud.users.query",
                        scope: $scope.$id,
                        interval: pollingInterval
                    }
                ).then(function (userList) {
                    updateUserList(userList);
                }, function (err) {
                    if (err && err.status) {
                        self.table.user = null;
                        CloudMessage.error([$translate.instant("openstackusers_users_userlist_error"), err.data && err.data.message || ""].join(" "));
                    }
                }, function (userList) {
                    updateUserList(userList);
                })["finally"](function () {
                    self.loaders.table.user = false;
                });
            }
        };

        function updateUserList (userList) {
            //We set autoSelected so the selected entries remain selected after polling.
            self.table.autoSelected = self.table.selected;

            self.table.users = userList;
            self.table.selectableUsers = getSelectableUserList(userList);
            self.orderBy();
            self.loaders.table.user = false;
        }

        function getSelectableUserList (userList) {
            return _.filter(userList, function (user) {
                return user.status !== "disabled";
            });
        }

        $scope.$on("$destroy", function () {
            Poller.kill({ namespace: "cloud.users.query" });
        });

        self.postUser = function () {
            if (!self.loaders.add.user) {
                self.loaders.add.user = true;
                return OvhApiCloud.Project().User().Lexi().save(self.userAdd).$promise.then(function (newUser) {
                    self.toggleAddUser();
                    self.table.selected = {};
                    OpenstackUsersPassword.put(self.projectId, newUser.id, newUser.password);
                    self.getUsers();
                    CloudMessage.success($translate.instant("openstackusers_users_userlist_add_submit_success"));
                    self.order.reverse = true;
                    self.order.by = "id";
                    return self.getUsers();
                }, function (err) {
                    CloudMessage.error([$translate.instant("openstackusers_users_userlist_add_submit_error"), err.data && err.data.message || ""].join(" "));
                })["finally"](function () {
                    self.loaders.add.user = false;
                });
            }
        };

        self.regeneratePassword = function (currentUser) {
            if (!self.loaders.regeneratePassword) {
                self.loaders.regeneratePassword = currentUser.id;
                return OvhApiCloud.Project().User().Lexi().password({
                    serviceName: self.projectId,
                    userId: currentUser.id
                }).$promise.then(function (newUser) {
                    var user = _.find(self.table.users, function (user) {
                        return user.username === currentUser.username;
                    });
                    OpenstackUsersPassword.put(self.projectId, user.id, newUser.password);
                    CloudMessage.success($translate.instant("openstackusers_users_regeneratepassword_success", currentUser));
                }, function (err) {
                    CloudMessage.error([$translate.instant("openstackusers_users_regeneratepassword_error"), err.data && err.data.message || ""].join(" "));
                })["finally"](function () {
                    self.loaders.regeneratePassword = false;
                });
            }
        };

        self.downloadOpenrcFile = function (currentUser) {
            ControllerHelper.modal.showModal({
                modalConfig: {
                    templateUrl: "app/cloud/project/openstack/users/openrc/openstack-users-openrc.html",
                    controller: "OpenstackUsersOpenrcCtrl",
                    controllerAs: "OpenstackUsersOpenrcCtrl",
                    resolve: {
                        openstackUser: function () {
                            return currentUser;
                        }
                    }
                }
            });
        };
        self.generateToken = function (currentUser) {
            ControllerHelper.modal.showModal({
                modalConfig: {
                    templateUrl: "app/cloud/project/openstack/users/token/openstack-users-token.html",
                    controller: "CloudProjectOpenstackUsersTokenCtrl",
                    controllerAs: "CloudProjectOpenstackUsersTokenCtrl",
                    resolve: {
                        openstackUser: function () {
                            return currentUser;
                        }
                    }
                }
            });
        };
        self.openDeleteUser = function (currentUser) {
            ControllerHelper.modal.showModal({
                modalConfig: {
                    templateUrl: "app/cloud/project/openstack/users/delete/openstack-users-delete.html",
                    controller: "CloudProjectOpenStackUserDeleteCtrl",
                    controllerAs: "CloudProjectOpenStackUserDeleteCtrl",
                    resolve: {
                        openstackUser: () => currentUser,
                        serviceName: () => self.projectId
                    }
                },
                successHandler: () => {
                    self.removeFromList(currentUser);
                    CloudMessage.success($translate.instant("openstackusers_users_delete_success", currentUser));                   
                },
                errorHandler: (err) => CloudMessage.error([$translate.instant("openstackusers_users_delete_error"), err.data && err.data.message || ""].join(" "))
            });
        };

        // Open Openstack Horizon in a new navigator window, pre-filling the user login
        self.openHorizon = function (user) {
            $window.open(REDIRECT_URLS.horizon.replace("{username}", user.username), "_blank");
        };

        self.getPassword = function (currentUser) {
            return OpenstackUsersPassword.get(self.projectId, currentUser.id);
        };

        self.removeFromList = function (user) {
            var index = _.findIndex(self.table.users, { id: user.id });
            if (index !== -1) {
                self.table.users.splice(index, 1);
            }
        };

        init();

    });
