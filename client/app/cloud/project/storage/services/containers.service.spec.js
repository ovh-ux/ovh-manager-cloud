"use strict";

describe("Service: CloudStorageContainers", function () {

    var projectId = "PROJECTID";

    var $httpBackend;
    var $q;
    var $rootScope;

    var cloudProjectStorageV6;
    var cloudStorageContainer;
    var cloudStorageContainers;

    beforeEach(module("managerAppMock"));

    beforeEach(inject([
        "$httpBackend",
        "$q",
        "$rootScope",
        "OvhApiCloudProjectStorageV6",
        "CloudStorageContainer",
        "CloudStorageContainers", function (
            _$httpBackend,
            _$q,
            _$rootScope,
            _OvhApiCloudProjectStorageV6,
            _cloudStorageContainer,
            _cloudStorageContainers) {
            $httpBackend = _$httpBackend;
            $q = _$q;
            $rootScope = _$rootScope;
            cloudProjectStorageV6 = _OvhApiCloudProjectStorageV6;
            cloudStorageContainer = _cloudStorageContainer;
            cloudStorageContainers = _cloudStorageContainers;
            setupMocks();
        }]));

    beforeEach(function () {
        $httpBackend.flush();
    });

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    describe("Containers listing", function () {
        it("should list containers", function (done) {
            cloudStorageContainers.list(projectId)
                .then(function (result) {
                    expect(result.length).toEqual(4);
                    expect(result[0]).toHaveString("id");
                });

            $rootScope.$apply();

            expect(cloudProjectStorageV6.query).toHaveBeenCalledWith(jasmine.objectContaining({
                projectId: projectId
            }));

            done();
        });
    });

    describe("Container creation", function () {
        it("should create a private container", function (done) {
            cloudStorageContainers.create(projectId, "xxx-private", "BHS1", "private")
                .then(function (result) {
                    expect(Object.keys(result).length).toEqual(6);
                });

            $rootScope.$apply();

            expect(cloudProjectStorageV6.save).toHaveBeenCalledWith(
                jasmine.objectContaining({
                    projectId: projectId
                }),
                jasmine.objectContaining({
                    containerName: "xxx-private",
                    region: "BHS1"
                })
            );
            expect(cloudStorageContainer.getMetaData).toHaveBeenCalledWith(projectId, "xxx-private-id");

            done();
        });
        it("should create a public container", function (done) {
            cloudStorageContainers.create(projectId, "xxx-public", "BHS1", "public")
                .then(function (result) {
                    expect(Object.keys(result).length).toEqual(7);
                });

            $rootScope.$apply();

            expect(cloudProjectStorageV6.save).toHaveBeenCalledWith(
                jasmine.objectContaining({
                    projectId: projectId
                }),
                jasmine.objectContaining({
                    containerName: "xxx-public",
                    region: "BHS1"
                })
            );
            expect(cloudStorageContainer.getMetaData).toHaveBeenCalledWith(projectId, "xxx-public-id");
            expect(cloudStorageContainer.setAsPublic).toHaveBeenCalledWith(projectId, "xxx-public-id");

            done();
        });
        it("should create a cold storage", function (done) {
            cloudStorageContainers.create(projectId, "xxx-cold", "BHS1", "archive")
                .then(function (result) {
                    expect(Object.keys(result).length).toEqual(6);
                });

            $rootScope.$apply();

            expect(cloudProjectStorageV6.save).toHaveBeenCalledWith(
                jasmine.objectContaining({
                    projectId: projectId
                }),
                jasmine.objectContaining({
                    containerName: "xxx-cold",
                    region: "BHS1",
                    archive: true
                })
            );
            expect(cloudStorageContainer.getMetaData).toHaveBeenCalledWith(projectId, "xxx-cold-id");

            done();
        });
        it("should create a static hosting", function (done) {
            cloudStorageContainers.create(projectId, "xxx-static", "BHS1", "static")
                .then(function (result) {
                    expect(Object.keys(result).length).toEqual(8);
                });

            $rootScope.$apply();

            expect(cloudProjectStorageV6.save).toHaveBeenCalledWith(
                jasmine.objectContaining({
                    projectId: projectId
                }),
                jasmine.objectContaining({
                    containerName: "xxx-static",
                    region: "BHS1"
                })
            );
            expect(cloudStorageContainer.getMetaData).toHaveBeenCalledWith(projectId, "xxx-static-id");
            expect(cloudProjectStorageV6.static).toHaveBeenCalledWith(jasmine.objectContaining({
                projectId: projectId,
                containerId: "xxx-static-id"
            }));

            done();
        });
    });

    describe("Container deletion", function () {
        it("should not delete a non empty container", function (done) {
            cloudStorageContainers.delete(projectId, "xxx-private-id")
                .then(function (result) {
                    expect(result).toBeUndefined();
                })
                .catch(function (error) {
                    expect(error).toBe("NON_EMPTY_CONTAINER");
                });

            $rootScope.$apply();

            expect(cloudProjectStorageV6.get).toHaveBeenCalledWith(jasmine.objectContaining({
                projectId: projectId,
                containerId: "xxx-private-id"
            }));

            done();
        });
        it("should delete a container", function (done) {
            cloudStorageContainers.delete(projectId, "xxx-public-id")
                .catch(function (error) {
                    expect(error).toBeUndefined();
                });

            $rootScope.$apply();

            expect(cloudProjectStorageV6.get).toHaveBeenCalledWith(jasmine.objectContaining({
                projectId: projectId,
                containerId: "xxx-public-id"
            }));
            expect(cloudProjectStorageV6["delete"]).toHaveBeenCalledWith(jasmine.objectContaining({
                projectId: projectId,
                containerId: "xxx-public-id"
            }));

            done();
        });
    });

    function setupMocks () {
        // Get container content
        spyOn(cloudProjectStorageV6, "get")
            .and.callFake(function (params) {
                return resourceResult({
                    "archive": false,
                    "storedBytes": params.containerId === "xxx-public-id" ? 0 : 93032,
                    "region": "bhs1",
                    "name": "container1",
                    "staticUrl": "container1.AUTH-abc123.storage.gra1.cloud.ovh.net",
                    "cors": [
                        "https:\/\/www.ovh.com",
                        "http:\/\/localhost:9000"
                    ],
                    "objects": params.containerId === "xxx-public-id" ? [] : [{
                        "retrievalDelay": 0,
                        "lastModified": "2017-01-16T19:05:05.8859Z",
                        "name": "Screen Shot 2016-12-19 at 4.26.22 PM.png",
                        "retrievalState": "unsealed",
                        "size": 93032,
                        "contentType": "image\/png"
                    }],
                    "public": true,
                    "storedObjects": params.containerId === "xxx-public-id" ? 0 : 1
                });
            });

        // List containers
        spyOn(cloudProjectStorageV6, "query")
            .and.returnValue(resourceResult([
                {
                    storedBytes: 0,
                    region: "GRA1",
                    name: "container1",
                    id: "xxx-public-id",
                    storedObjects: 0
                }, {
                    storedBytes: 93032,
                    region: "BHS1",
                    name: "container2",
                    id: "xxx-private-id",
                    storedObjects: 1
                }, {
                    storedBytes: 98364,
                    region: "SBG1",
                    name: "container3",
                    id: "xxx-static-id",
                    storedObjects: 9
                }, {
                    storedBytes: 567886533,
                    region: "SBG1",
                    name: "container4",
                    id: "xxx-cold-id",
                    storedObjects: 486
                }
            ]));

        spyOn(cloudStorageContainer, "getMetaData")
            .and.callFake(function (projectId, containerId) {
                switch (containerId) {
                    case "xxx-public-id":
                        return $q.resolve({
                            "X-Storage-Policy": "PCS",
                            "X-Container-Read": ".r:*,.rlistings"
                        });
                    case "xxx-private-id":
                        return $q.resolve({
                            "X-Storage-Policy": "PCS"
                        });
                    case "xxx-static-id":
                        return $q.resolve({
                            "X-Storage-Policy": "PCS",
                            "X-Container-Read": ".r:*,.rlistings",
                            "X-Container-Meta-Web-Listings": "true"
                        });
                    case "xxx-cold-id":
                        return $q.resolve({
                            "X-Storage-Policy": "PCA"
                        });
                    default:
                        return { $promise: $q.reject() };
                }
            });

        spyOn(cloudStorageContainer, "setAsPublic")
            .and.returnValue($q.resolve(null));

        spyOn(cloudProjectStorageV6, "save")
            .and.callFake(function (params, data) {
                var containerName = data.containerName;
                switch (containerName) {
                    case "xxx-public":
                        return resourceResult({
                            storedBytes: 0,
                            region: "GRA1",
                            name: "container1",
                            id: "xxx-public-id",
                            storedObjects: 0
                        });
                    case "xxx-private":
                        return resourceResult({
                            storedBytes: 93032,
                            region: "BHS1",
                            name: "container2",
                            id: "xxx-private-id",
                            storedObjects: 1
                        });
                    case "xxx-static":
                        return resourceResult({
                            storedBytes: 98364,
                            region: "SBG1",
                            name: "container3",
                            id: "xxx-static-id",
                            storedObjects: 9
                        });
                    case "xxx-cold":
                        return resourceResult({
                            storedBytes: 567886533,
                            region: "SBG1",
                            name: "container4",
                            id: "xxx-cold-id",
                            storedObjects: 486
                        });
                    default:
                        return { $promise: $q.reject() };
                }
            });

        spyOn(cloudProjectStorageV6, "static")
            .and.returnValue(resourceResult(null));

        spyOn(cloudProjectStorageV6, "delete")
            .and.returnValue(resourceResult(null));
    }

    function resourceResult (result) {
        return {
            $promise: $q.resolve(result)
        };
    }
});
