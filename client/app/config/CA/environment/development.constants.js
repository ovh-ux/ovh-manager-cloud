"use strict";

angular.module("managerApp").constant("CONFIG", {
    env: "development"
}).constant("CONFIG_API", {
    apis: [
        {
            serviceType: "apiv6",
            urlPrefix: "apiv6"
        },
        {
            serviceType: "aapi",
            urlPrefix: "2api"
        },
        {
            serviceType: "apiv7",
            urlPrefix: "apiv7"
        }
    ],
    loginUrl: "/auth",
    userUrl: "/apiv6/me"
});
