"use strict";

import {Router} from "express";
import proxy from "http-proxy-middleware";
import config from "../../config/environment";

var router = new Router();

// Redirect request to a sdev instead of API
/* jshint loopfunc:true */
if (config.env === "development" && config.sdev && config.sdev.routes && config.sdev.routes.length) {
    for (var i = 0, l = config.sdev.routes.length; i < l; i++) {
        router.all(config.sdev.routes[i], proxy({
            target: config.sdev.url,
            changeOrigin: true,
            pathRewrite: {
                "^/api/" : "/",
                "^/apiv6/" : "/",
                "^/engine/api/" : "/",
                "^/engine/apiv6/" : "/"
            },
            headers: {
                "X-Ovh-Nic" : config.sdev.nic
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
