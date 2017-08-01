"use strict";

import {Router} from "express";
import proxy from "http-proxy-middleware";
import config from "../../config/environment";

var router = new Router();

// Proxy to APIv7
router.all("/*", proxy({
    target: config.apiv7.url,
    changeOrigin: true,
    pathRewrite: {
        "^/apiv7/" : "/",
        "^/engine/apiv7/" : "/"
    },
    headers : {
        "X-Ovh-ApiVersion" : "beta"
    },
    secure: false,
    logLevel: "debug"
}));

export default router;
