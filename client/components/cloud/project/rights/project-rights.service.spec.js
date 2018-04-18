"use strict";

describe("Controller: ProjectRightsService", function () {

    // load the controller"s module
    beforeEach(module("managerAppMock"));

    var projectRightsService;
    var CloudProjectAclV6Mock;
    var CloudProjectServiceInfosV6Mock;
    var UserV6Mock;
    var $q;
    var $rootScope;

    var user = {
        nichandle: "userName"
    };

    function setupCloudProject(acl, contactAdmin) {
        spyOn(UserV6Mock, "get").and.returnValue({
            $promise: $q.when(user)
        });

        spyOn(CloudProjectAclV6Mock, "query").and.returnValue({
            $promise: $q.when(acl)
        });
        spyOn(CloudProjectServiceInfosV6Mock, "get").and.returnValue({
            $promise: $q.when({
                contactAdmin: contactAdmin
            })
        });
    }

    beforeEach(inject(function (OvhApiCloudProjectAclV6, OvhApiMeV6, CloudProjectRightService, OvhApiCloudProjectServiceInfosV6, _$httpBackend_, _$q_, _$rootScope_) {
        $q = _$q_;
        $rootScope = _$rootScope_;
        var $httpBackend = _$httpBackend_;
        CloudProjectAclV6Mock = OvhApiCloudProjectAclV6;
        CloudProjectServiceInfosV6Mock = OvhApiCloudProjectServiceInfosV6;
        UserV6Mock = OvhApiMeV6;
        projectRightsService = CloudProjectRightService;
        $httpBackend.whenGET(/translations\/Messages\w+\.json$/).respond(200, {});
        $httpBackend.whenGET("app/home/home.html").respond(200, {});
        $httpBackend.flush();
    }));

    describe("userHaveReadWriteRights", function () {
        it("should return true if user is admin", function () {
            setupCloudProject([], user.nichandle);

            projectRightsService.userHaveReadWriteRights("ProjectId")
                .then(function(result) {
                    expect(result).toBeTruthy();
                });

            $rootScope.$apply();
        });

        it("should return true if user had received rights", function () {
            setupCloudProject([user.nichandle], "admin");

            projectRightsService.userHaveReadWriteRights("ProjectId")
                .then(function(result) {
                    expect(result).toBeTruthy();
                });

            $rootScope.$apply();
        });

        it("should return false if user is not admin or had received rights.", function () {
            setupCloudProject([], "admin");

            projectRightsService.userHaveReadWriteRights("ProjectId")
                .then(function(result) {
                    expect(result).toBeFalsy();
                });

            $rootScope.$apply();
        });
    });
});
