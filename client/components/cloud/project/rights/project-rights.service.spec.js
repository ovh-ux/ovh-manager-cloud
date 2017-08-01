"use strict";

describe("Controller: ProjectRightsService", function () {

    // load the controller"s module
    beforeEach(module("managerAppMock"));

    var projectRightsService;
    var CloudProjectAclLexiMock;
    var CloudProjectServiceInfosLexiMock;
    var UserLexiMock;
    var $q;
    var $rootScope;

    var user = {
        nichandle: "userName"
    };

    function setupCloudProject(acl, contactAdmin) {
        spyOn(UserLexiMock, "get").and.returnValue({
            $promise: $q.when(user)
        });

        spyOn(CloudProjectAclLexiMock, "query").and.returnValue({
            $promise: $q.when(acl)
        });
        spyOn(CloudProjectServiceInfosLexiMock, "get").and.returnValue({
            $promise: $q.when({
                contactAdmin: contactAdmin
            })
        });
    }

    beforeEach(inject(function (CloudProjectAclLexi, UserLexi, CloudProjectRightService, CloudProjectServiceInfosLexi, _$httpBackend_, _$q_, _$rootScope_) {
        $q = _$q_;
        $rootScope = _$rootScope_;
        var $httpBackend = _$httpBackend_;
        CloudProjectAclLexiMock = CloudProjectAclLexi;
        CloudProjectServiceInfosLexiMock = CloudProjectServiceInfosLexi;
        UserLexiMock = UserLexi;
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
