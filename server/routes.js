/**
 * Main application routes
 */

"use strict";

import path from "path";
import request from "request";
import errors from "./components/errors";
import config from "./config/environment";

export default function (app) {

    // Auth
    app.use("/", require("./auth").default);

    if (config.proxy) {
        app.use((req, res) => {
            var headers = req.headers;
            var url = config.proxy.target + "/engine" + req.url;

            req.pipe(request({
                url: url,
                method: req.method,
                proxy: config.proxy.host,
                headers: headers
            })).pipe(res);
        });
    }

    // APIv6
    app.use(/^\/(?:engine\/)?api(?:v6)?/, require("./proxy/apiv6").default);
    // // APIv7
    app.use(/^\/(?:engine\/)?apiv7/, require("./proxy/apiv7").default);
    // // 2API
    app.use(/^\/(?:engine\/)?2api/, require("./proxy/2api").default);

    // All undefined asset or api routes should return a 404
    app.route("/:url(auth|components|app|bower_components|assets|fonts)/*").get(function (req, res) {
        if (
            (
                req.path.match(/Messages_.._..\.json$/) ||
                req.path.match(/app\.css$/)
            ) && req.path.indexOf("bower_components") === -1
        ) {
            res.sendFile(path.join(path.normalize(__dirname + "/../.tmp"), req.path));
        } else {
            res.sendFile(path.join(path.normalize(__dirname + "/../client"), req.path));
        }
    }).get(errors[404]);


    // All other routes should redirect to the index.html
    app.route("/*").get((req, res) => {
        res.sendFile(path.resolve(app.get("appPath") + "/index.html"));
    });
}
