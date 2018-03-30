"use strict";



//     THIS IS CODE IS OBSOLETE



angular.module("managerApp") .controller("CloudProjectComputeInfrastructureIpAddCtrl",
    function ($rootScope, $scope, $timeout, $translate, $q, OvhApiCloud, CloudProjectComputeInfrastructureOrchestrator, RegionService) {

        var self = this;
        self.regionService = RegionService;

        // -------------- QUANTITY AND GEOLOC CHANGES

        self.decrementQuantity = function () {
            if (self.model.quantity > self.minQuantity) {
                self.model.quantity--;
            }
        };

        self.incrementQuantity = function () {
            if (self.model.quantity < self.maxQuantity) {
                self.model.quantity++;
            }
        };

        $scope.$watch('InfrastructureIpAddEditCtrl.model.geoloc', function (value, oldValue) {
            if (value && value !== oldValue) {
                self.backToMenu();
            }
        });

        // ---

        // -------------- MENU ACTIONS

        self.openEditDetail = function() {
            $scope.$broadcast('adaptative.switch.page.goToPage', 2);

            $timeout(function () {
                var $checkedRadio = $('input[name=geolocChoice]:checked');
                if ($checkedRadio && $checkedRadio.length) {
                    var $checkedRadioCtnr = $checkedRadio.closest('.panel-body');
                    $checkedRadioCtnr.scrollTo($checkedRadio, 200, { offset: -100 });
                    $checkedRadio.closest(':tabbable').focus();
                }
            }, 99);
        };

        self.backToMenu = function () {
            $scope.$broadcast('adaptative.switch.page.goToPage', 1);
        };

        // ---

        // -------------- LEFT PAGE FOOTER ACTIONS

        self.cancelIpAdd = function () {
            $rootScope.$broadcast('ip.add.cancel');
            // reset overlay
            $rootScope.$broadcast('highlighed-element.hide');
        };

        self.launchIpCreation = function () {
            CloudProjectComputeInfrastructureOrchestrator.createNewIps(this.model);
            // close popover and hide overlay
            self.cancelIpAdd();
        };

        // what to do before popover hide
        $scope.$on('adaptativePopover.before.hide', function () {
            // mmmmhhh strange but if no timeout, draft-ip is still present in dom after cancel...
            $timeout(self.cancelIpAdd);
        });

        // ---

        // -------------- INITIALIZATION

        function init () {
            // set min and max quantity available to add
            self.minQuantity = 1;
            self.maxQuantity = 32;
            // set default model
            self.model = {
                quantity : self.minQuantity,
                geoloc : 'FR'
            };
            // set focus on popover
            $timeout(function () {
                $('.cloud-ip-popover').find(':tabbable:first').focus();
            }, 99);
            // set overlay
            $rootScope.$broadcast('highlighed-element.show', 'compute,draft-ip');
            // get possible geolocs
            self.locLoader = true;
            return OvhApiCloud.v6().schema().$promise.then(function (schema) {
                self.availableGeolocs = schema.models['ip.FloatingIpGeolocEnum']['enum'];
                self.locLoader = false;
            });
        }

        init();

        // ---
    }
);
