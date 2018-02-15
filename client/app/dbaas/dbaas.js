/**
 *  Two main sections (IaaS and PaaS)
 */
angular.module("managerApp")
    .config($stateProvider => {
        $stateProvider
            .state("dbaas", {
                url: "/dbaas",
                "abstract": true,
                template: `
                    <div ui-view="dbaasContainer"></div>
                `,
                translations: ["common", "cloud"]
            });
    });
