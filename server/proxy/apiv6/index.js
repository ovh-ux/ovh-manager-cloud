"use strict";

import {Router} from "express";
import proxy from "http-proxy-middleware";
import config from "../../config/environment";

var router = new Router();

// Redirect request to a dev instead of API
/* jshint loopfunc:true */
if (config.env === "development" && config.dev && config.dev.routes && config.dev.routes.length) {
    for (var i = 0, l = config.dev.routes.length; i < l; i++) {
        router.all(config.dev.routes[i], proxy({
            target: config.dev.url,
            changeOrigin: true,
            pathRewrite: {
                "^/api/" : "/",
                "^/apiv6/" : "/",
                "^/engine/api/" : "/",
                "^/engine/apiv6/" : "/"
            },
            headers: {
                "X-Ovh-Nic" : config.dev.nic
            },
            secure: false,
            logLevel: "debug"
        }));
    }
}
/* jshint loopfunc:false */

// Proxy to APIv6
router.all("/*", proxy({
    target: config.apiv6.url,
    changeOrigin: true,
    pathRewrite: {
        "^/api/" : "/",
        "^/apiv6/" : "/",
        "^/engine/api/" : "/",
        "^/engine/apiv6/" : "/"
    },
    secure: false,
    logLevel: "debug"
}));

export default router;
