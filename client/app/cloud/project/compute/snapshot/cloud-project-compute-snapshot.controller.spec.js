// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!  TODO REMOVE THIS FILE FROM EXCLUDE LIST IN KARMA.CONF.JS FILE   !!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

"use strict";

describe("Controller: CloudProjectComputeSnapshotCtrl", function () {

    var dataTest = readJSON('client/bower_components/ovh-api-services/src/cloud/project/snapshot/cloud-project-snapshot.service.dt.spec.json');

    // load the controller"s module
    beforeEach(module("managerAppMock"));

    var ssoAuthentication,
        $httpBackend,
        $rootScope,
        $controller,
        $timeout,
        Toast,
        CloudProjectSnapshot,
        CloudProjectOrchestrator,
        $state,
        $scope;

    beforeEach(inject(function (_ssoAuthentication_, _$httpBackend_, _$rootScope_, _$controller_, _CloudProjectSnapshot_, _Toast_, _$timeout_, _CloudProjectOrchestrator_) {

        ssoAuthentication = _ssoAuthentication_;
        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
        $controller = _$controller_;
        $timeout = _$timeout_;
        CloudProjectSnapshot = _CloudProjectSnapshot_;
        Toast = _Toast_;
        CloudProjectOrchestrator = _CloudProjectOrchestrator_;
        $state = {
            go : function(){
                return true;
            }
        };

        spyOn(Toast, "error");
        spyOn(Toast, "success");
        spyOn(Toast, "info");
        spyOn(CloudProjectSnapshot.Lexi(), "resetQueryCache");

        $scope = $rootScope.$new();
        $scope.searchSnapshotForm = {
            $valid : true
        };
    }));

    afterEach(inject(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
        $scope.$destroy();
    }));

    //-----

    var CloudProjectComputeSnapshotCtrl;

    function initNewCtrl () {
        CloudProjectComputeSnapshotCtrl = $controller("CloudProjectComputeSnapshotCtrl", {
            $scope : $scope,
            $state : $state,
            $stateParams : {
                projectId : 'ac2b990f1d6e42899e764a8084bdf766'
            }
        });
        $scope.CloudProjectComputeSnapshotCtrl = CloudProjectComputeSnapshotCtrl;
    }

    //-----

    describe("- Initialization controller in success case -", function () {

        beforeEach(function (){
            $httpBackend.whenGET(/\/cloud\/project\/[a-z0-9]+\/snapshot/).respond(200, dataTest.snapshots);
            initNewCtrl();

            $httpBackend.flush();
        });

        xit("should set default value", function () {
            expect(CloudProjectSnapshot.Lexi().resetQueryCache.calls.any()).toEqual(false);

            expect(CloudProjectComputeSnapshotCtrl.table.snapshot).toBeArrayOfObjects();
            expect(CloudProjectComputeSnapshotCtrl.table.snapshotFilter).toBeArrayOfObjects();
            expect(CloudProjectComputeSnapshotCtrl.table.selected).toEqual({});
            expect(CloudProjectComputeSnapshotCtrl.table.autoSelected).toEqual([]);

            expect(_.isEqual(CloudProjectComputeSnapshotCtrl.table.snapshot[0].toJSON(), dataTest.snapshots[0])).toBeTruthy();
            expect(_.isEqual(CloudProjectComputeSnapshotCtrl.table.snapshot[1].toJSON(), dataTest.snapshots[1])).toBeTruthy();
            expect(_.isEqual(CloudProjectComputeSnapshotCtrl.table.snapshotFilter[0].toJSON(), dataTest.snapshots[6])).toBeTruthy();
            expect(_.isEqual(CloudProjectComputeSnapshotCtrl.table.snapshotFilter[1].toJSON(), dataTest.snapshots[0])).toBeTruthy();

            expect(CloudProjectComputeSnapshotCtrl.toggle.snapshotDeleteId).toBeNull();
            expect(CloudProjectComputeSnapshotCtrl.toggle.openDeleteMultiConfirm).toBeFalsy();

            expect(CloudProjectComputeSnapshotCtrl.loaders.table.snapshot).toBeFalsy();
            expect(CloudProjectComputeSnapshotCtrl.loaders.remove.snapshot).toBeFalsy();
            expect(CloudProjectComputeSnapshotCtrl.loaders.remove.snapshotMulti).toBeFalsy();

            expect(CloudProjectComputeSnapshotCtrl.order.by).toEqual('name');
            expect(CloudProjectComputeSnapshotCtrl.order.reverse).toBeFalsy();

            expect(CloudProjectComputeSnapshotCtrl.search.open).toBeFalsy();
            expect(CloudProjectComputeSnapshotCtrl.search.name).toBeNull();
            expect(CloudProjectComputeSnapshotCtrl.search.minDisk).toBeNull();
            expect(CloudProjectComputeSnapshotCtrl.search.creationStart).toBeNull();
            expect(CloudProjectComputeSnapshotCtrl.search.creationEnd).toBeNull();
        });

        //-----

        describe("- Display function -", function () {

            xit("should open and close search form.", function () {

                //Should open search bar
                CloudProjectComputeSnapshotCtrl.toggleSearchBar();

                expect(CloudProjectComputeSnapshotCtrl.search.open).toBeTruthy();

                CloudProjectComputeSnapshotCtrl.search.name = "pikachu";
                CloudProjectComputeSnapshotCtrl.search.minDisk = 40;
                CloudProjectComputeSnapshotCtrl.search.creationStart = "Thu Mar 10 2015 00:00:00 GMT+0100 (CET)";
                CloudProjectComputeSnapshotCtrl.search.creationEnd = "Thu Mar 15 2015 00:00:00 GMT+0100 (CET)";

                $scope.$apply();
                $timeout.flush();

                expect(_.isEqual(CloudProjectComputeSnapshotCtrl.table.snapshotFilter[0].toJSON(), dataTest.snapshots[5])).toBeTruthy();
                expect(CloudProjectComputeSnapshotCtrl.table.snapshotFilter.length).toEqual(1);

                //Should close search bar without reinit search values but not apply filter
                CloudProjectComputeSnapshotCtrl.toggleSearchBar();

                $scope.$apply();
                $timeout.flush();

                expect(CloudProjectComputeSnapshotCtrl.search.open).toBeFalsy();
                expect(CloudProjectComputeSnapshotCtrl.search.name ).toEqual('pikachu');
                expect(CloudProjectComputeSnapshotCtrl.search.minDisk ).toEqual(40);
                expect(CloudProjectComputeSnapshotCtrl.search.creationStart ).toEqual('Thu Mar 10 2015 00:00:00 GMT+0100 (CET)');
                expect(CloudProjectComputeSnapshotCtrl.search.creationEnd ).toEqual('Thu Mar 15 2015 00:00:00 GMT+0100 (CET)');

                expect(CloudProjectComputeSnapshotCtrl.table.snapshotFilter.length).toEqual(CloudProjectComputeSnapshotCtrl.table.snapshot.length);

                //Should re-open search bar and reinit search values
                CloudProjectComputeSnapshotCtrl.toggleSearchBar();

                $scope.$apply();
                $timeout.flush();

                expect(CloudProjectComputeSnapshotCtrl.search.open).toBeTruthy();
                expect(CloudProjectComputeSnapshotCtrl.search.name).toBeNull();
                expect(CloudProjectComputeSnapshotCtrl.search.minDisk).toBeNull();
                expect(CloudProjectComputeSnapshotCtrl.search.creationStart).toBeNull();
                expect(CloudProjectComputeSnapshotCtrl.search.creationEnd).toBeNull();

                expect(CloudProjectComputeSnapshotCtrl.table.snapshotFilter.length).toEqual(CloudProjectComputeSnapshotCtrl.table.snapshot.length);
            });

            //-----

            xit("should sort table.", function () {

                //init by name
                expect(CloudProjectComputeSnapshotCtrl.order.by).toEqual('name');
                expect(CloudProjectComputeSnapshotCtrl.order.reverse).toBeFalsy();

                expect(_.isEqual(CloudProjectComputeSnapshotCtrl.table.snapshot[0].toJSON(), dataTest.snapshots[0])).toBeTruthy();
                expect(_.isEqual(CloudProjectComputeSnapshotCtrl.table.snapshotFilter[0].toJSON(), dataTest.snapshots[6])).toBeTruthy();

                //sort by minDisk asc
                CloudProjectComputeSnapshotCtrl.orderBy('minDisk');

                expect(CloudProjectComputeSnapshotCtrl.order.by).toEqual('minDisk');
                expect(CloudProjectComputeSnapshotCtrl.order.reverse).toBeFalsy();

                expect(_.isEqual(CloudProjectComputeSnapshotCtrl.table.snapshot[0].toJSON(), dataTest.snapshots[0])).toBeTruthy();
                expect(_.isEqual(CloudProjectComputeSnapshotCtrl.table.snapshotFilter[0].toJSON(), dataTest.snapshots[4])).toBeTruthy();

                //sort by minDisk desc
                CloudProjectComputeSnapshotCtrl.orderBy('minDisk');

                expect(CloudProjectComputeSnapshotCtrl.order.by).toEqual('minDisk');
                expect(CloudProjectComputeSnapshotCtrl.order.reverse).toBeTruthy();

                expect(_.isEqual(CloudProjectComputeSnapshotCtrl.table.snapshot[0].toJSON(), dataTest.snapshots[0])).toBeTruthy();
                expect(_.isEqual(CloudProjectComputeSnapshotCtrl.table.snapshotFilter[7].toJSON(), dataTest.snapshots[4])).toBeTruthy();

            });

            //-----

            xit("should call CloudProjectOrchestrator and $state.go to install snapshot.", function () {
                spyOn(CloudProjectOrchestrator, "askToCreateInstanceFromSnapshot");
                spyOn($state, "go");

                CloudProjectComputeSnapshotCtrl.createVmBySnapshot(CloudProjectComputeSnapshotCtrl.table.snapshot[0].toJSON());

                expect(CloudProjectOrchestrator.askToCreateInstanceFromSnapshot.calls.count()).toEqual(1);
                expect($state.go.calls.count()).toEqual(1);
                expect(Toast.info.calls.count()).toEqual(1);
            });

            //-----

            xit("should select table line and open/close confirm delete.", function () {

                expect(CloudProjectComputeSnapshotCtrl.table.selected).toEqual({});
                expect(CloudProjectComputeSnapshotCtrl.toggle.openDeleteMultiConfirm).toBeFalsy();
                expect(CloudProjectComputeSnapshotCtrl.getSelectedCount()).toEqual(0);

                //select 1st line
                CloudProjectComputeSnapshotCtrl.table.selected[CloudProjectComputeSnapshotCtrl.table.snapshotFilter[0].id] = true;
                $scope.$apply();
                expect(CloudProjectComputeSnapshotCtrl.toggle.openDeleteMultiConfirm).toBeFalsy();
                expect(CloudProjectComputeSnapshotCtrl.getSelectedCount()).toEqual(1);

                //Confirm
                CloudProjectComputeSnapshotCtrl.toggleDeleteMultiConfirm();
                expect(CloudProjectComputeSnapshotCtrl.toggle.openDeleteMultiConfirm).toBeTruthy();

                //select 2nd line
                CloudProjectComputeSnapshotCtrl.table.selected[CloudProjectComputeSnapshotCtrl.table.snapshotFilter[2].id] = true;
                $scope.$apply();

                expect(CloudProjectComputeSnapshotCtrl.toggle.openDeleteMultiConfirm).toBeFalsy();
                expect(CloudProjectComputeSnapshotCtrl.getSelectedCount()).toEqual(2);

                //Confirm
                CloudProjectComputeSnapshotCtrl.toggleDeleteMultiConfirm();
                expect(CloudProjectComputeSnapshotCtrl.toggle.openDeleteMultiConfirm).toBeTruthy();

                //Cancel
                CloudProjectComputeSnapshotCtrl.toggleDeleteMultiConfirm();
                expect(CloudProjectComputeSnapshotCtrl.toggle.openDeleteMultiConfirm).toBeFalsy();

                expect(CloudProjectComputeSnapshotCtrl.table.selected).toEqual({});
            });
        });


        //-----

        describe("- Delete snapshot -", function () {

            describe("success case", function () {

                beforeEach(function (){
                    $httpBackend.whenDELETE(/\/cloud\/project\/[a-z0-9]+\/snapshot\/[a-z0-9\-]+/).respond(200, null);
                });

                xit("should delete one snapshot", function () {
                    CloudProjectComputeSnapshotCtrl.toggle.snapshotDeleteId = dataTest.snapshots[0].id;

                    CloudProjectComputeSnapshotCtrl.deleteSnapshot(dataTest.snapshots[0]);
                    $httpBackend.flush();

                    expect(CloudProjectSnapshot.Lexi().resetQueryCache.calls.count()).toEqual(1);
                    expect(CloudProjectComputeSnapshotCtrl.loaders.remove.snapshot).toBeFalsy();
                    expect(Toast.success.calls.count()).toEqual(1);
                });

            });

            describe("error case", function () {

                beforeEach(function (){
                    $httpBackend.whenDELETE(/\/cloud\/project\/[a-z0-9]+\/snapshot\/[a-z0-9\-]+/).respond(500, dataTest.error);
                });

                xit("should throw an error when delete one snapshot", function () {
                    CloudProjectComputeSnapshotCtrl.toggle.snapshotDeleteId = dataTest.snapshots[0].id;

                    spyOn(CloudProjectComputeSnapshotCtrl, "getSnapshot");

                    CloudProjectComputeSnapshotCtrl.deleteSnapshot(dataTest.snapshots[0]);
                    $httpBackend.flush();

                    expect(CloudProjectComputeSnapshotCtrl.loaders.remove.snapshot).toBeFalsy();
                    expect(CloudProjectComputeSnapshotCtrl.getSnapshot.calls.any()).toEqual(false);
                    expect(Toast.error.calls.count()).toEqual(1);
                });
            });

        });


        //-----

        describe("- Delete multi snapshot -", function () {

            describe("success case", function () {

                beforeEach(function (){
                    $httpBackend.whenDELETE(/\/cloud\/project\/[a-z0-9]+\/snapshot\/[a-z0-9\-]+/).respond(200, null);
                });

                xit("should delete multi snapshot", function () {

                    expect(CloudProjectComputeSnapshotCtrl.table.selected).toEqual({});

                    //select 1st line
                    CloudProjectComputeSnapshotCtrl.table.selected[CloudProjectComputeSnapshotCtrl.table.snapshotFilter[0].id] = true;
                    CloudProjectComputeSnapshotCtrl.table.selected[CloudProjectComputeSnapshotCtrl.table.snapshotFilter[1].id] = true;
                    CloudProjectComputeSnapshotCtrl.table.selected[CloudProjectComputeSnapshotCtrl.table.snapshotFilter[2].id] = true;
                    CloudProjectComputeSnapshotCtrl.table.selected[CloudProjectComputeSnapshotCtrl.table.snapshotFilter[3].id] = true;
                    CloudProjectComputeSnapshotCtrl.table.selected[CloudProjectComputeSnapshotCtrl.table.snapshotFilter[4].id] = true;

                    expect(CloudProjectComputeSnapshotCtrl.table.autoSelected).toEqual([]);

                    CloudProjectComputeSnapshotCtrl.deleteMultiSnapshot();
                    $httpBackend.flush();

                    expect(CloudProjectComputeSnapshotCtrl.loaders.remove.snapshotMulti).toBeFalsy();
                    expect(CloudProjectSnapshot.Lexi().resetQueryCache.calls.count()).toEqual(1);
                    expect(Toast.success.calls.count()).toEqual(1);
                    expect(CloudProjectComputeSnapshotCtrl.table.autoSelected).toEqual([]);
                    //expect(CloudProjectComputeSnapshotCtrl.table.selected).toEqual({});
                });

            });

            describe("error case", function () {

                beforeEach(function (){
                    $httpBackend.whenDELETE(/\/cloud\/project\/[a-z0-9]+\/snapshot\/[a-z0-9\-]*[a-df-z0-9\-]$/).respond(200, null);
                    $httpBackend.whenDELETE(/\/cloud\/project\/[a-z0-9]+\/snapshot\/[a-z0-9\-]+e$/).respond(500, dataTest.error);
                });

                xit("should throw an error when delete one snapshot", function () {

                    expect(CloudProjectComputeSnapshotCtrl.table.selected).toEqual({});

                    CloudProjectComputeSnapshotCtrl.table.selected[CloudProjectComputeSnapshotCtrl.table.snapshotFilter[0].id] = true;
                    CloudProjectComputeSnapshotCtrl.table.selected[CloudProjectComputeSnapshotCtrl.table.snapshotFilter[1].id] = true;
                    CloudProjectComputeSnapshotCtrl.table.selected[CloudProjectComputeSnapshotCtrl.table.snapshotFilter[2].id] = true;
                    CloudProjectComputeSnapshotCtrl.table.selected[CloudProjectComputeSnapshotCtrl.table.snapshotFilter[3].id] = true;
                    CloudProjectComputeSnapshotCtrl.table.selected[CloudProjectComputeSnapshotCtrl.table.snapshotFilter[4].id] = true;

                    expect(CloudProjectComputeSnapshotCtrl.table.autoSelected).toEqual([]);

                    CloudProjectComputeSnapshotCtrl.deleteMultiSnapshot();
                    $httpBackend.flush();

                    expect(CloudProjectComputeSnapshotCtrl.loaders.remove.snapshotMulti).toBeFalsy();
                    expect(CloudProjectSnapshot.Lexi().resetQueryCache.calls.count()).toEqual(1);
                    expect(Toast.error.calls.count()).toEqual(1);

                    expect(CloudProjectComputeSnapshotCtrl.table.autoSelected.length).toEqual(1);
                    //expect(CloudProjectComputeSnapshotCtrl.getSelectedCount()).toEqual(1);
                });
            });
        });
    });

    //-----

    describe("- Initialization controller in error case -", function () {

        beforeEach(function (){
            $httpBackend.whenGET(/\/cloud\/project\/[a-z0-9]+\/snapshot/).respond(500, dataTest.error);
            initNewCtrl();

            $httpBackend.flush();
        });


        xit("should throw an error when get snapshots", function () {
            expect(CloudProjectSnapshot.Lexi().resetQueryCache.calls.any()).toEqual(false);

            expect(CloudProjectComputeSnapshotCtrl.table.snapshot).toBeNull();
            expect(CloudProjectComputeSnapshotCtrl.table.snapshotFilter).toEqual([]);
            expect(CloudProjectComputeSnapshotCtrl.table.selected).toEqual({});
            expect(CloudProjectComputeSnapshotCtrl.table.autoSelected).toEqual([]);

            expect(CloudProjectComputeSnapshotCtrl.toggle.snapshotDeleteId).toBeNull();
            expect(CloudProjectComputeSnapshotCtrl.toggle.openDeleteMultiConfirm).toBeFalsy();

            expect(CloudProjectComputeSnapshotCtrl.loaders.table.snapshot).toBeFalsy();
            expect(CloudProjectComputeSnapshotCtrl.loaders.remove.snapshot).toBeFalsy();
            expect(CloudProjectComputeSnapshotCtrl.loaders.remove.snapshotMulti).toBeFalsy();

            expect(CloudProjectComputeSnapshotCtrl.order.by).toEqual('name');
            expect(CloudProjectComputeSnapshotCtrl.order.reverse).toBeFalsy();

            expect(CloudProjectComputeSnapshotCtrl.search.open).toBeFalsy();
            expect(CloudProjectComputeSnapshotCtrl.search.name).toBeNull();
            expect(CloudProjectComputeSnapshotCtrl.search.minDisk).toBeNull();
            expect(CloudProjectComputeSnapshotCtrl.search.creationStart).toBeNull();
            expect(CloudProjectComputeSnapshotCtrl.search.creationEnd).toBeNull();

            expect(Toast.error.calls.count()).toEqual(1);
        });
    });
});
