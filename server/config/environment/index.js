"use strict";

var path = require("path");
var _ = require("lodash");

function requiredProcessEnv (name) {
    if (!process.env[name]) {
        throw new Error("You must set the " + name + " environment variable");
    }
    return process.env[name];
}

var zone = process.env.ZONE || "EU";

// All configurations will extend these options
// ============================================
var all = {
    env: process.env.NODE_ENV,

    // Root path of server
    root: path.normalize(__dirname + "/../../.."),

    // Server port
    port: process.env.PORT || 9000,

    // Server IP
    ip: process.env.IP || "0.0.0.0",

    // Secret for session, you will want to change this and make it an environment variable
    secrets: {
        session: "manager-secret"
    },

    // MongoDB connection options
    mongo: {
        options: {
            db: {
                safe: true
            }
        }
    },

    // List of user roles
    userRoles: ["guest", "user", "admin"],

    // DEV proxy config
    dev : {
        nic : process.env.DEV_NIC || '',
        url : process.env.DEV_URL || '',
        routes: []
    }

};

var zoneConfig = {
    EU: {
        ssoAuth: {
            host: "www.ovh.com",
            devLoginUrl: "https://www.ovh.com/auth/requestDevLogin/",
            baseUrl: "https://www.ovh.com/cgi-bin/crosslogin.cgi"
        },
        apiv6: {
            url: "https://www.ovh.com/engine/apiv6"
        },
        apiv7: {
            url: "https://www.ovh.com/engine/apiv7"
        },
        aapi: {
            url: process.env.LOCAL_2API === "true" ? "http://localhost:8080" : "https://www.ovh.com/engine/2api"
        }
    },
    CA: {
        ssoAuth: {
            host: "ca.ovh.com",
            devLoginUrl: "https://ca.ovh.com/auth/requestDevLogin/",
            baseUrl: "https://ca.ovh.com/cgi-bin/crosslogin.cgi"
        },
        apiv6: {
            url: "https://ca.ovh.com/engine/apiv6"
        },
        apiv7: {
            url: "https://ca.ovh.com/engine/apiv7"
        },
        aapi: {
            url: process.env.LOCAL_2API === "true" ? "http://localhost:8080" : "https://ca.ovh.com/engine/2api"
        }
    },
    US: {
        ssoAuth: {
            host: "www.ovh.us",
            devLoginUrl: "https://www.ovh.us/auth/requestDevLogin/",
            baseUrl: "https://www.ovh.us/cgi-bin/crosslogin.cgi"
        },
        apiv6: {
            url: "https://www.ovh.us/engine/apiv6"
        },
        apiv7: {
            url: "https://www.ovh.us/engine/apiv7"
        },
        aapi: {
            url: process.env.LOCAL_2API === "true" ? "http://localhost:8080" : "https://www.ovh.us/engine/2api"
        },
        //Simply remove these lines when US is prodded
        proxy: {
            host: "http://proxy.prod.ovh.us:3128",
            target: "https://www.ovh.us"
        }
    }
};

// Export the config object based on the NODE_ENV
// ==============================================
module.exports = _.merge(
    all,
    {"zone": zone},
    zoneConfig[zone],
    require("./" + process.env.NODE_ENV + ".js") || {});
