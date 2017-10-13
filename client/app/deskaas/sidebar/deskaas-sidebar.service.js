angular.module("managerApp").service("deskaasSidebar", function ($rootScope, OvhApiDeskaasService, $q, SidebarMenu) {
    "use strict";

    var self = this;

    /*====================================
      =            SECTION LOAD            =
      ====================================*/

    /*----------  API CALL  ----------*/

    self.getServices = function () {

        return $q(function (resolve) {

            OvhApiDeskaasService.Lexi().query()
                .$promise
                .then(function (serviceNames) {

                    var requests = [];

                    angular.forEach(
                        serviceNames,
                        function (serviceName) {

                            requests
                                .push(
                                    OvhApiDeskaasService.Lexi()
                                        .get({ serviceName: serviceName })
                                        .$promise
                                        .then(function (service) {
                                            return service;
                                        }, function () {
                                            // Quick fix for prod. Plz handle 404 and 460
                                            return { serviceName: serviceName, alias: "", error: true };
                                        })
                                );
                        });

                    $q.all(requests).then(function (elements) {
                        resolve(elements);
                    });

                })
                .catch(function () {
                    resolve();
                });
        });
    };

    self.getEntryMenu = function (service) {
        var id = "deskaas_" + service.serviceName;
        var title = service.alias === "noAlias" || service.alias === "" ? service.serviceName : service.alias + " (" + service.serviceName + ")";
        return { id: id, title: title };
    };

    /* */
    self.updateItem = function (service) {
        var entry = self.getEntryMenu(service);
        if (self.section) {
            SidebarMenu.updateItemDisplay({
                title: entry.title
            }, entry.id, self.section.id);
        }
    };

    /*----------  FILL  ----------*/

    self.loadIntoSection = function (section, services) {
        self.section = section;
        services = services.sort();
        //For each project, add an item
        angular.forEach(services, function (service) {
            if (!service.error) {
                var entry = self.getEntryMenu(service);
                SidebarMenu.addMenuItem({
                    id: entry.id,
                    title: entry.title,
                    // icon: "dedicated-cloud2",
                    state: "deskaas.details",
                    stateParams: {
                        serviceName: service.serviceName
                    }
                }, section);
            }
        });
    };

    /*-----  End of SECTION LOAD  ------*/

});

