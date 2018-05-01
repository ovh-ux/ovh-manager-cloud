"use strict";

describe("Controller: OpenstackUsersCtrl", function () {

    var dataTest = readJSON("client/bower_components/ovh-api-services/src/cloud/project/user/cloud-project-user.service.dt.spec.json");

    var ssoAuthentication;
    var $httpBackend;
    var $rootScope;
    var $controller;
    var $timeout;
    var CloudMessage;
    var Cloud;
    var $state;
    var PasswordService;
    var OpenstackUsersToken;
    var $scope;

    beforeEach(inject(function (_ssoAuthentication_, _$httpBackend_, _$rootScope_, _$controller_, _OvhApiCloud_, _CloudMessage_, _$timeout_, _OpenstackUsersPassword_, _OpenstackUsersToken_) {

        ssoAuthentication = _ssoAuthentication_;
        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
        $controller = _$controller_;
        $timeout = _$timeout_;
        Cloud = _OvhApiCloud_;
        CloudMessage = _CloudMessage_;
        PasswordService = _OpenstackUsersPassword_;
        OpenstackUsersToken = _OpenstackUsersToken_;
        $state = {
            go: function () {
                return true;
            }
        };

        spyOn(CloudMessage, "error");
        spyOn(CloudMessage, "success");
        spyOn(CloudMessage, "info");
        spyOn(Cloud.Project().User().v6(), "resetQueryCache");

        $scope = $rootScope.$new();
    }));

    afterEach(inject(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
        $scope.$destroy();
    }));

    //-----

    var OpenstackUsersCtrl;
    var projectId = "ac2b990f1d6e42899e764a8084bdf766";

    function initNewCtrl () {
        OpenstackUsersCtrl = $controller("CloudProjectOpenstackUsersCtrl", {
            $scope: $scope,
            $state: $state,
            projectId: projectId
        });
        $scope.OpenstackUsersCtrl = OpenstackUsersCtrl;
    }

    //-----

    describe("- Initialization controller in success case -", function () {

        beforeEach(function () {
            $httpBackend.whenGET(/\/cloud\/project\/[a-z0-9]+\/user/).respond(200, dataTest.users);
            initNewCtrl();

            $httpBackend.flush();
        });

        xit("should set default value", function () {
            expect(Cloud.Project().User().v6().resetQueryCache.calls.any()).toEqual(false);

            expect(OpenstackUsersCtrl.table.users).toBeArrayOfObjects();
            expect(OpenstackUsersCtrl.table.selected).toEqual({});
            expect(OpenstackUsersCtrl.table.autoSelected).toEqual([]);

            expect(_.isEqual(OpenstackUsersCtrl.table.users[0], dataTest.users[0])).toBeTruthy();
            expect(_.isEqual(OpenstackUsersCtrl.table.users[1], dataTest.users[1])).toBeTruthy();

            expect(OpenstackUsersCtrl.toggle.userDeleteId).toBeNull();
            expect(OpenstackUsersCtrl.toggle.openUserMultiConfirm).toBeFalsy();

            expect(OpenstackUsersCtrl.loaders.table.user).toBeFalsy();
            expect(OpenstackUsersCtrl.loaders.remove.user).toBeFalsy();
            expect(OpenstackUsersCtrl.loaders.remove.userMulti).toBeFalsy();

            expect(OpenstackUsersCtrl.order.by).toEqual("id");
            expect(OpenstackUsersCtrl.order.reverse).toBeTruthy();
        });

        //-----

        describe("- Display function -", function () {

            xit("should sort table.", function () {

                //init by name
                expect(OpenstackUsersCtrl.order.by).toEqual("id");
                expect(OpenstackUsersCtrl.order.reverse).toBeTruthy();

                expect(_.isEqual(OpenstackUsersCtrl.table.users[0], dataTest.users[0])).toBeTruthy();

                //sort by minDisk asc
                OpenstackUsersCtrl.orderBy("username");

                expect(OpenstackUsersCtrl.order.by).toEqual("username");
                expect(OpenstackUsersCtrl.order.reverse).toBeTruthy();

                expect(_.isEqual(OpenstackUsersCtrl.table.users[0], dataTest.users[0])).toBeTruthy();

                //sort by minDisk desc
                OpenstackUsersCtrl.orderBy("username");

                expect(OpenstackUsersCtrl.order.by).toEqual("username");
                expect(OpenstackUsersCtrl.order.reverse).toBeFalsy();

                expect(_.isEqual(OpenstackUsersCtrl.table.users[0], dataTest.users[1])).toBeTruthy();

            });

            //-----

            xit("should select table line and open/close confirm delete.", function () {

                expect(OpenstackUsersCtrl.table.selected).toEqual({});
                expect(OpenstackUsersCtrl.toggle.openDeleteMultiConfirm).toBeFalsy();
                expect(OpenstackUsersCtrl.getSelectedCount()).toEqual(0);

                //select 1st line
                OpenstackUsersCtrl.table.selected[OpenstackUsersCtrl.table.users[0].id] = true;
                $scope.$apply();
                expect(OpenstackUsersCtrl.toggle.openDeleteMultiConfirm).toBeFalsy();
                expect(OpenstackUsersCtrl.getSelectedCount()).toEqual(1);

                //Confirm
                OpenstackUsersCtrl.toggleDeleteMultiConfirm();
                expect(OpenstackUsersCtrl.toggle.openDeleteMultiConfirm).toBeTruthy();

                //select 2nd line
                OpenstackUsersCtrl.table.selected[OpenstackUsersCtrl.table.users[1].id] = true;
                $scope.$apply();

                expect(OpenstackUsersCtrl.toggle.openDeleteMultiConfirm).toBeTruthy();
                expect(OpenstackUsersCtrl.getSelectedCount()).toEqual(2);

                //Confirm
                OpenstackUsersCtrl.toggleDeleteMultiConfirm();
                expect(OpenstackUsersCtrl.toggle.openDeleteMultiConfirm).toBeFalsy();

                //Cancel
                OpenstackUsersCtrl.toggleDeleteMultiConfirm();
                expect(OpenstackUsersCtrl.toggle.openDeleteMultiConfirm).toBeTruthy();

                expect(OpenstackUsersCtrl.table.selected).toEqual({});
            });
        });

        //-----

        describe("- regenerate password", function () {

            describe("success case", function () {

                beforeEach(function () {
                    $httpBackend.whenPOST(/\/cloud\/project\/[a-z0-9]+\/user\/[a-z0-9\-]+\/regeneratePassword/).respond(200, dataTest.regeneratePassword);
                });

                xit("should send a password into the service", function () {
                    spyOn(PasswordService, "put");

                    OpenstackUsersCtrl.regeneratePassword(dataTest.users[0]);

                    $httpBackend.flush();

                    expect(_.isEqual(OpenstackUsersCtrl.table.users[0], dataTest.users[0])).toBeTruthy();
                    expect(PasswordService.put).toHaveBeenCalledWith(projectId, dataTest.users[0].id, dataTest.regeneratePassword.password);
                    expect(OpenstackUsersCtrl.loaders.regeneratePassword).toBeFalsy();
                    expect(CloudMessage.success.calls.count()).toEqual(1);
                });
            });

            describe("error case", function () {

                beforeEach(function () {
                    $httpBackend.whenPOST(/\/cloud\/project\/[a-z0-9]+\/user\/[a-z0-9\-]+\/regeneratePassword/).respond(500, dataTest.error);
                });

                xit("should send a password into the service", function () {
                    OpenstackUsersCtrl.regeneratePassword(dataTest.users[0]);

                    spyOn(PasswordService, "put");
                    $httpBackend.flush();

                    expect(_.isEqual(OpenstackUsersCtrl.table.users[0], dataTest.users[0])).toBeTruthy();
                    expect(PasswordService.put).not.toHaveBeenCalled();
                    expect(CloudMessage.error.calls.count()).toEqual(1);
                });
            });
        });

        describe("- get token", function () {

            describe("success case", function () {

                beforeEach(function () {
                    $httpBackend.whenPOST(/\/cloud\/project\/[a-z0-9]+\/user\/[a-z0-9\-]+\/token/).respond(200, dataTest.token);
                });

                xit("should send a password into the service", function () {
                    OpenstackUsersCtrl.generateToken(dataTest.users[0]);

                    spyOn(OpenstackUsersToken, "put");
                    $httpBackend.flush();

                    expect(_.isEqual(OpenstackUsersCtrl.table.users[0], dataTest.users[0])).toBeTruthy();
                    expect(OpenstackUsersToken.put).toHaveBeenCalled();
                    expect(OpenstackUsersCtrl.loaders.generateToken).toBeFalsy();
                    expect(CloudMessage.success.calls.count()).toEqual(1);
                });
            });

            describe("error case", function () {

                beforeEach(function () {
                    $httpBackend.whenPOST(/\/cloud\/project\/[a-z0-9]+\/user\/[a-z0-9\-]+\/token/).respond(500, dataTest.error);
                });

                xit("should send a password into the service", function () {
                    OpenstackUsersCtrl.generateToken(dataTest.users[0]);

                    spyOn(OpenstackUsersToken, "put");
                    $httpBackend.flush();

                    expect(_.isEqual(OpenstackUsersCtrl.table.users[0], dataTest.users[0])).toBeTruthy();
                    expect(OpenstackUsersToken.put).not.toHaveBeenCalled();
                    expect(CloudMessage.error.calls.count()).toEqual(1);
                });

            });
        });

        describe("- Delete user -", function () {

            describe("success case", function () {

                beforeEach(function () {
                    $httpBackend.whenDELETE(/\/cloud\/project\/[a-z0-9]+\/user\/[a-z0-9\-]+/).respond(200, null);
                });

                xit("should delete one user", function () {
                    OpenstackUsersCtrl.toggle.userDeleteId = dataTest.users[0].id;

                    OpenstackUsersCtrl.deleteUser(dataTest.users[0]);
                    $httpBackend.flush();

                    expect(_.isEqual(OpenstackUsersCtrl.table.users[0], dataTest.users[0])).toBeFalsy();
                    expect(OpenstackUsersCtrl.loaders.remove.user).toBeFalsy();
                    expect(CloudMessage.success.calls.count()).toEqual(1);
                });

            });

            describe("error case", function () {

                beforeEach(function () {
                    $httpBackend.whenDELETE(/\/cloud\/project\/[a-z0-9]+\/user\/[a-z0-9\-]+/).respond(500, dataTest.error);
                });

                xit("should throw an error when delete one user", function () {
                    OpenstackUsersCtrl.toggle.userDeleteId = dataTest.users[0].id;

                    OpenstackUsersCtrl.deleteUser(dataTest.users[0]);
                    $httpBackend.flush();

                    expect(OpenstackUsersCtrl.loaders.remove.user).toBeFalsy();

                    expect(_.isEqual(OpenstackUsersCtrl.table.users[0], dataTest.users[0])).toBeTruthy();
                    expect(CloudMessage.error.calls.count()).toEqual(1);
                });
            });

        });

        //-----

        describe("- Delete multi users -", function () {

            describe("success case", function () {

                beforeEach(function () {
                    $httpBackend.whenDELETE(/\/cloud\/project\/[a-z0-9]+\/user\/[a-z0-9\-]+/).respond(200, null);
                });

                xit("should delete multi users", function () {

                    expect(OpenstackUsersCtrl.table.selected).toEqual({});

                    //select 1st line
                    OpenstackUsersCtrl.table.selected[OpenstackUsersCtrl.table.users[0].id] = true;
                    OpenstackUsersCtrl.table.selected[OpenstackUsersCtrl.table.users[1].id] = true;

                    expect(OpenstackUsersCtrl.table.autoSelected).toEqual([]);

                    OpenstackUsersCtrl.deleteMultiUsers();
                    $httpBackend.flush();

                    expect(OpenstackUsersCtrl.loaders.remove.userMulti).toBeFalsy();
                    expect(CloudMessage.success.calls.count()).toEqual(1);
                    expect(OpenstackUsersCtrl.table.autoSelected).toEqual([]);
                });

            });

            describe("error case", function () {

                beforeEach(function () {
                    $httpBackend.whenDELETE(/\/cloud\/project\/[a-z0-9]+\/user\/1251$/).respond(500, dataTest.error);
                    $httpBackend.whenDELETE(/\/cloud\/project\/[a-z0-9]+\/user\/1250$/).respond(200, null);
                });

                xit("should throw an error when delete one user", function () {

                    expect(OpenstackUsersCtrl.table.selected).toEqual({});

                    OpenstackUsersCtrl.table.selected[OpenstackUsersCtrl.table.users[0].id] = true;
                    OpenstackUsersCtrl.table.selected[OpenstackUsersCtrl.table.users[1].id] = true;

                    expect(OpenstackUsersCtrl.table.autoSelected).toEqual([]);

                    OpenstackUsersCtrl.deleteMultiUsers();
                    $httpBackend.flush();

                    expect(OpenstackUsersCtrl.loaders.remove.userMulti).toBeFalsy();
                    expect(CloudMessage.error.calls.count()).toEqual(1);
                    expect(OpenstackUsersCtrl.table.autoSelected.length).toEqual(1);
                });
            });
        });
    });

    describe("- Initialization controller in error case -", function () {

        beforeEach(function () {
            $httpBackend.whenGET(/\/cloud\/project\/[a-z0-9]+\/user/).respond(500, dataTest.error);
            initNewCtrl();

            $httpBackend.flush();
        });

        xit("should throw an error when get snapshots", function () {
            expect(Cloud.Project().User().v6().resetQueryCache.calls.any()).toEqual(false);

            expect(OpenstackUsersCtrl.table.users).toEqual([]);
            expect(OpenstackUsersCtrl.table.selected).toEqual({});
            expect(OpenstackUsersCtrl.table.autoSelected).toEqual([]);

            expect(OpenstackUsersCtrl.toggle.userDeleteId).toBeNull();
            expect(OpenstackUsersCtrl.toggle.openDeleteMultiConfirm).toBeFalsy();

            expect(OpenstackUsersCtrl.loaders.table.users).toBeFalsy();
            expect(OpenstackUsersCtrl.loaders.remove.user).toBeFalsy();
            expect(OpenstackUsersCtrl.loaders.remove.userMulti).toBeFalsy();

            expect(OpenstackUsersCtrl.order.by).toEqual("id");
            expect(OpenstackUsersCtrl.order.reverse).toBeTruthy();

            expect(CloudMessage.error.calls.count()).toEqual(1);
        });
    });
});
