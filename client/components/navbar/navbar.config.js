angular.module("managerApp")
    .run(($rootScope, ManagerNavbarService) => {
        ManagerNavbarService.getNavbar().then((navbar) => {
            $rootScope.navbar = navbar;
        });
    });
