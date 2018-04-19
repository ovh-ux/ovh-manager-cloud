"use strict";

describe("Service: CloudStorageContainer", function () {

    var projectId = "PROJECTID";
    var containerId = "CONTAINERID";
    var testUrl = "https://storage.sbg1.cloud.ovh.net/v1/AUTH_abc123/the_file";

    var $httpBackend;
    var $q;
    var $rootScope;

    var cloudProjectStorageV6;
    var cloudStorageContainer;
    var CLOUD_PCA_FILE_STATE;

    beforeEach(module("managerAppMock"));

    beforeEach(inject([
        "$httpBackend",
        "$q",
        "$rootScope",
        "OvhApiCloudProjectStorageV6",
        "CloudStorageContainer",
        "CLOUD_PCA_FILE_STATE", function (
            _$httpBackend,
            _$q,
            _$rootScope,
            _OvhApiCloudProjectStorageV6,
            _cloudStorageContainer,
            _CLOUD_PCA_FILE_STATE) {
            $httpBackend = _$httpBackend;
            $q = _$q;
            $rootScope = _$rootScope;
            cloudProjectStorageV6 = _OvhApiCloudProjectStorageV6;
            cloudStorageContainer = _cloudStorageContainer;
            CLOUD_PCA_FILE_STATE = _CLOUD_PCA_FILE_STATE;
            setupApiMocks();
            setupContainerMocks();
        }]));

    beforeEach(function () {
        $httpBackend.flush();
    });

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    describe("Get container meta data", function () {
        it("should get meta data", function (done) {
            cloudStorageContainer.getMetaData(projectId, containerId)
                .then(function (result) {
                    expect(result).toBeTruthy();
                    expect(Object.keys(result).length).toEqual(6);
                });

            $httpBackend.expect(
                "HEAD",
                "https://storage.bhs1.cloud.ovh.net/v1/AUTH_abc123/container1",
                null,
                function (headers) {
                    return headers["X-Auth-Token"] === "TOKEN";
                }
            );

            $rootScope.$apply();
            $httpBackend.flush();
            done();
        });
    });

    describe("Objects listing", function () {
        it("should list objects", function (done) {
            cloudStorageContainer.list(projectId, containerId)
                .then(function (result) {
                    expect(result).toBeTruthy();
                    expect(result.objects).toBeTruthy();
                });

            expect(cloudProjectStorageV6.get).toHaveBeenCalledWith(jasmine.objectContaining({
                projectId: projectId,
                containerId: containerId
            }));

            $rootScope.$apply();
            done();
        });
    });

    describe("Objects download", function () {
        describe("Sealed object", function () {
            it("should just unseal object", function (done) {
                cloudStorageContainer.download(projectId, containerId, {
                        retrievalState: CLOUD_PCA_FILE_STATE.SEALED,
                        name: "a_file.txt"
                    });

                expect(cloudProjectStorageV6.getURL).toHaveBeenCalledWith(
                    jasmine.objectContaining({
                        projectId: projectId,
                        containerId: containerId
                    }), {
                        expirationDate: jasmine.any(String),
                        objectName: jasmine.any(String)
                    });

                $httpBackend.expectGET("https://storage.sbg1.cloud.ovh.net/v1/AUTH_abc123/the_file")
                    .respond(200);

                $rootScope.$apply();
                $httpBackend.flush();
                done();
            });
        });
        describe("Unsealed object", function () {
            it("should return URL", function (done) {
                cloudStorageContainer.download(projectId, containerId, {
                        retrievalState: CLOUD_PCA_FILE_STATE.UNSEALED,
                        name: "the_file"
                    })
                    .then(function (url) {
                        expect(url).toBe(testUrl);
                    });

                $rootScope.$apply();

                expect(cloudProjectStorageV6.getURL).toHaveBeenCalledWith(
                    jasmine.objectContaining({
                        projectId: projectId,
                        containerId: containerId
                    }), {
                        expirationDate: jasmine.any(String),
                        objectName: jasmine.any(String)
                    });

                done();
            });
        });
    });

    describe("Object upload", function () {
        it("should upload object", function (done) {
            var xhr = {
                open: function () {},
                upload: {
                    addEventListener: function () {}
                },
                addEventListener: function () {},
                setRequestHeader: function () {},
                send: function () {}
            };
            XMLHttpRequest = function () {  // jshint ignore:line
                return xhr;
            };

            spyOn(xhr, "open");
            spyOn(xhr, "send");
            spyOn(xhr, "setRequestHeader");

            cloudStorageContainer.upload(projectId, containerId, {
                file: {
                    data: new Blob(["123"], { type: "plain/text" }),
                    name: "file.txt",
                    type: "text/plain"
                }
            });

            $rootScope.$apply();

            expect(cloudProjectStorageV6.get).toHaveBeenCalled();
            expect(xhr.open).toHaveBeenCalledWith("PUT", "https://storage.bhs1.cloud.ovh.net/v1/AUTH_abc123/container1/file.txt", true);
            expect(xhr.setRequestHeader).toHaveBeenCalledWith("Content-Type", "text/plain");
            expect(xhr.setRequestHeader).toHaveBeenCalledWith("X-Auth-Token", "TOKEN");
            expect(xhr.send).toHaveBeenCalledWith(jasmine.objectContaining({
                data: jasmine.any(Blob),
                name: "file.txt"
            }));

            done();
        });
    });

    describe("Object deletion", function () {
        it("should delete object", function (done) {
            cloudStorageContainer.delete(projectId, containerId,  "fake/file");

            $httpBackend.expect(
                "DELETE",
                "https://storage.bhs1.cloud.ovh.net/v1/AUTH_abc123/container1/fake%2Ffile",
                null,
                function (headers) {
                    return headers["X-Auth-Token"] === "TOKEN";
                }
            );

            $rootScope.$apply();
            $httpBackend.flush();
            done();
        });
    });

    describe("Set container as public", function () {
        it("should update container ACL", function (done) {
            cloudStorageContainer.setAsPublic(projectId, containerId);

            $httpBackend.expect(
                "PUT",
                "https://storage.bhs1.cloud.ovh.net/v1/AUTH_abc123/container1",
                null,
                function (headers) {
                    return headers["X-Auth-Token"] === "TOKEN" &&
                        headers["X-Container-Read"] === ".r:*,.rlistings";
                }
            );

            $httpBackend.flush();
            done();
        });
    });

    function setupApiMocks () {
        spyOn(cloudProjectStorageV6, "access")
            .and.returnValue(resourceResult({
                endpoints: [
                    { url: "https://storage.bhs1.cloud.ovh.net/v1/AUTH_abc123", region: "BHS1" },
                    { url: "https://storage.sbg1.cloud.ovh.net/v1/AUTH_abc123", region: "SBG1" },
                    { url: "https://storage.gra1.cloud.ovh.net/v1/AUTH_abc123", region: "GRA1" }
                ],
                token: "TOKEN"
            }));

        spyOn(cloudProjectStorageV6, "cors")
            .and.returnValue(resourceResult(null));

        spyOn(cloudProjectStorageV6, "get")
            .and.callFake(function (params) {
                if (params.containerId) {
                    return resourceResult({
                        "archive": false,
                        "storedBytes": 93032,
                        "region": "bhs1",
                        "name": "container1",
                        "staticUrl": "container1.AUTH-abc123.storage.bhs1.cloud.ovh.net",
                        "cors": [
                            "https:\/\/www.ovh.com",
                            "http:\/\/localhost:9000"
                        ],
                        "objects": [{
                            "retrievalDelay": 0,
                            "lastModified": "2017-01-16T19:05:05.8859Z",
                            "name": "Screen Shot 2016-12-19 at 4.26.22 PM.png",
                            "retrievalState": "unsealed",
                            "size": 93032,
                            "contentType": "image\/png"
                        }],
                        "public": true,
                        "storedObjects": 1
                    });
                }
            });

        spyOn(cloudProjectStorageV6, "query")
            .and.returnValue(resourceResult([{
                    storedBytes: 0,
                    region: "bhs1",
                    name: "container1",
                    id: "xxx-public-id",
                    storedObjects: 0
                }])
            );

        spyOn(cloudProjectStorageV6, "getURL")
            .and.returnValue(resourceResult({
                getURL: testUrl
            }));
    }

    function setupContainerMocks () {
        $httpBackend.whenHEAD("https://storage.bhs1.cloud.ovh.net/v1/AUTH_abc123/container1")
            .respond(null, {
                "Content-Length": 0,
                "Content-Type": "application/json; charset=utf-8",
                "Date": "Tue, 17 Jan 2017 16:06:24 GMT",
                "X-Container-Bytes-Used": "93032",
                "X-Container-Meta-Access-Control-Allow-Origin": "https://www.ovh.com http://localhost:9000",
                "X-Container-Object-Count": "1",
                "X-Container-Read": ".r:*,.rlistings",
                "X-Storage-Policy": "PCS",
                "X-Timestamp": "1481137857.33925",
                "X-Trans-Id": "tx2e06a651af0f4f039c5dd-00587e4100"
            });
        $httpBackend.whenDELETE("https://storage.bhs1.cloud.ovh.net/v1/AUTH_abc123/container1/fake%2Ffile")
            .respond(200);
        $httpBackend.whenPUT("https://storage.bhs1.cloud.ovh.net/v1/AUTH_abc123/container1")
            .respond(null, null);
        $httpBackend.whenPUT("https://storage.sbg1.cloud.ovh.net/v1/AUTH_abc123/the_file")
            .respond(200);
    }

    function resourceResult (result) {
        return {
            $promise: $q.resolve(result)
        };
    }

});
