angular.module("managerApp")
    .run(($rootScope, ManagerNavbarService) => {
        // Get first base structure of the navbar, to avoid heavy loading
        ManagerNavbarService.getNavbar().then((navbar) => {
            $rootScope.navbar = navbar;

            // Then get the products links, to build the reponsive menu
            ManagerNavbarService.getResponsiveLinks()
                .then((responsiveLinks) => {
                    $rootScope.navbar.responsiveLinks = responsiveLinks;
                });
        });
    });
