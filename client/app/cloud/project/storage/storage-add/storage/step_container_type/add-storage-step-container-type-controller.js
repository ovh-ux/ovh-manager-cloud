angular.module("managerApp").controller("RA.add.storage.stepContainerTypeCtrl", ["$scope", "$translate", "URLS", "TranslateService", "User",
    function ($scope, $translate, URLS, TranslateService, User) {
        var self = this;
        "use strict";

        $scope.childStep = "name";

        $scope.categories = [{
            code: "pcs",
            name: $translate.instant("add_storage_category_pcs"),
            moreInfo: {
                url: URLS.website_order.pcs["GB"] || URLS.website_order.pcs["WE"]
            },
            options: [{
                type: "static",
                name: $translate.instant("add_storage_type_static_hosting"),
                description: $translate.instant("add_storage_type_static_hosting_description"),
                shortcut: "swift_cname",
                visible: true
            },
            {
                type: "private",
                name: $translate.instant("add_storage_type_private"),
                description: $translate.instant("add_storage_type_private_description"),
                shortcut: "swift_private",
                visible: true
            },
            {
                type: "public",
                name: $translate.instant("add_storage_type_public"),
                description: $translate.instant("add_storage_type_public_description"),
                shortcut: "swift_public",
                visible: true
            }]
        }, {
            code: "pca",
            name: $translate.instant("add_storage_category_pca"),
            moreInfo: {
                url: URLS.website_order.pca["GB"] || URLS.website_order.pca["WE"]
            },
            options: [{
                type: "archive",
                name: $translate.instant("add_storage_type_cold"),
                description: $translate.instant("add_storage_type_cold_description"),
                shortcut: "pca",
                visible: true
            }]
        }];

        $scope.clickOnContainerType = function (type) {
            $scope.model.containerType = _.clone(type);
            $scope.loadStep($scope.childStep);
        };

        self.$onInit = function () {
            User.Lexi().get().$promise.then(function (me) {
                var lang = me.ovhSubsidiary;
                _.forEach($scope.categories, category => {
                    category.moreInfo.url = URLS.website_order[category.code][lang];
                });
            });
        }
    }]);
