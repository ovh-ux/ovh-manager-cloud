angular.module("managerApp")
    .config($stateProvider => {
        $stateProvider
            .state("paas.cda", {
                url: "/cda",
                template: "<div ui-view=\"cdaDetails\"></div>",
                translations: ["common", "cda"],
                abstract: true
            });
    })
    .run(($transitions, CdaService) => {
        $transitions.onSuccess({ to: "paas.cda.**" }, transition => {
            CdaService.initDetails(transition.params().serviceName);
        });
    });
