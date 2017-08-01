/**
 * Express configuration
 */

"use strict";

import express from "express";
import favicon from "serve-favicon";
import morgan from "morgan";
import compression from "compression";
import methodOverride from "method-override";
import errorHandler from "errorhandler";
import path from "path";
import lusca from "lusca";
import config from "./environment";
import session from "express-session";

export default function (app) {
    var env = app.get("env");

    app.set("views", config.root + "/server/views");
    app.engine("html", require("ejs").renderFile);
    app.set("view engine", "html");
    app.use(compression());
    app.use(methodOverride());

    // Persist sessions with MongoStore / sequelizeStore
    // We need to enable sessions for passport-twitter because it's an
    // oauth 1.0 strategy, and Lusca depends on sessions
    app.use(session({
        secret: config.secrets.session,
        saveUninitialized: true,
        resave: false
    }));

    /**
     * Lusca - express server security
     * https://github.com/krakenjs/lusca
     */
    if (env !== "test" && env !== "development") {
        app.use(lusca({
            csrf: {
                angular: true
            },
            xframe: "SAMEORIGIN",
            hsts: {
                maxAge: 31536000, //1 year, in seconds
                includeSubDomains: true,
                preload: true
            },
            xssProtection: true
        }));
    }

    app.set("appPath", path.join(config.root, "client"));

    if (env === "production") {
        app.use(favicon(path.join(config.root, "client", "favicon.ico")));
        app.use(express.static(app.get("appPath")));
        app.use(morgan("dev"));
    }

    if (env === "development") {
        app.use(require("connect-livereload")());
    }

    if (env === "development" || env === "test") {
        app.use(express.static(path.join(config.root, ".tmp")));
        app.use(express.static(app.get("appPath")));
        app.use(morgan("dev"));
        app.use(errorHandler()); // Error handler - has to be last
    }
}
