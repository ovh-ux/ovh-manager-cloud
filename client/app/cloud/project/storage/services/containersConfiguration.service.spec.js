"use strict";

describe("Service: CloudStorageContainersConfiguration", function () {

    var projectId = "PROJECTID";
    var containerId = "CONTAINERID";

    var cloudStorageContainersConfiguration;

    var testData = {
        name: "container_name",
        region: "region_name",
        otherData: {
            foo: "bar",
            baz: "qux"
        }
    };

    beforeEach(module("managerAppMock"));

    beforeEach(inject([
        "CloudStorageContainersConfiguration", function (_cloudStorageContainersConfiguration) {
            cloudStorageContainersConfiguration = _cloudStorageContainersConfiguration;
        }]));

    describe("Containers Meta Cache", function () {
        it("should cache data", function () {
            cloudStorageContainersConfiguration.containerMetaCache.set(projectId, containerId, testData);
        });

        it("should get cached data", function () {
            cloudStorageContainersConfiguration.containerMetaCache.set(projectId, containerId, testData);

            var savedData = cloudStorageContainersConfiguration.containerMetaCache.get(projectId, containerId);
            expect(savedData).toEqual(jasmine.objectContaining(testData));
        });

        it("should get specific cached data", function () {
            cloudStorageContainersConfiguration.containerMetaCache.set(projectId, containerId, testData);

            var savedData = cloudStorageContainersConfiguration.containerMetaCache.get(projectId, containerId, "region");
            expect(savedData).toEqual(testData.region);
        });

        it("should get nested specific cached data", function () {
            cloudStorageContainersConfiguration.containerMetaCache.set(projectId, containerId, testData);

            var savedData = cloudStorageContainersConfiguration.containerMetaCache.get(projectId, containerId, "otherData.baz");
            expect(savedData).toEqual(testData.otherData.baz);
        });

        it("should not fail if data is not found", function () {
            cloudStorageContainersConfiguration.containerMetaCache.set(projectId, containerId, testData);

            var savedData = cloudStorageContainersConfiguration.containerMetaCache.get(projectId, containerId, "dataThatDontExist");
            expect(savedData).toBeUndefined();
        });

        it("should update existing cache", function () {
            cloudStorageContainersConfiguration.containerMetaCache.set(projectId, containerId, testData);
            cloudStorageContainersConfiguration.containerMetaCache.update(projectId, containerId, "newProperty1.newProperty1_2", "newValue");
            cloudStorageContainersConfiguration.containerMetaCache.update(projectId, containerId, "name", "newName");

            var savedData = cloudStorageContainersConfiguration.containerMetaCache.get(projectId, containerId);
            expect(savedData).toEqual(jasmine.objectContaining({
                region: "region_name",
                name: "newName",
                newProperty1: {
                    "newProperty1_2": "newValue"
                }
            }));
        });

        it("should create new cache when updating non existing cache", function () {
            cloudStorageContainersConfiguration.containerMetaCache.update(projectId, containerId, testData);

            var savedData = cloudStorageContainersConfiguration.containerMetaCache.get(projectId, containerId);
            expect(savedData).toEqual(jasmine.objectContaining(testData));
        });

        it("should remove existing cache", function () {
            cloudStorageContainersConfiguration.containerMetaCache.set(projectId, containerId, testData);

            var savedData = cloudStorageContainersConfiguration.containerMetaCache.get(projectId, containerId);
            expect(savedData).toBeDefined();

            cloudStorageContainersConfiguration.containerMetaCache.remove(projectId, containerId);

            savedData = cloudStorageContainersConfiguration.containerMetaCache.get(projectId, containerId);
            expect(savedData).toBeUndefined();
        });

        it("should not fail while trying to remove undefined cache", function () {
            cloudStorageContainersConfiguration.containerMetaCache.remove(projectId, containerId);
        });
    });

});
