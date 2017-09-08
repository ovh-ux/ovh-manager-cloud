angular.module("managerApp")
    .run((atInternet, managerNavbar, NavbarService, $translate, $translatePartialLoader, $q, $uibModal, OvhApiMe) => {

        $translatePartialLoader.addPart("common");
        $translatePartialLoader.addPart("module-otrs");

        $q.allSettled([
            $translate.refresh(),
            OvhApiMe.Lexi().get().$promise
        ])
            .then(resp => resp && resp[1])
            .catch(resp => resp && resp[1])
            .then(user => {
                NavbarService.init();
                if (!user) {
                    managerNavbar.internalLinks.push(NavbarService.createLoginMenu());
                } else {
                    managerNavbar.setExternalLinks(NavbarService.createManagersMenu());
                    managerNavbar.internalLinks.push(NavbarService.createAssistanceMenu(user.ovhSubsidiary));
                    managerNavbar.internalLinks.push(NavbarService.createBillingMenu());
                    managerNavbar.internalLinks.push(NavbarService.createLanguageMenu());
                    managerNavbar.internalLinks.push(NavbarService.createUserMenu(user));
                }
            });
    });
