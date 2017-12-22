"use strict";

import proxy from "request";
import cookie from "cookie";
import winston from "winston";
import config from "../../config/environment";
import base64url from "base64url";

// [SSO] authentication
export function login (req, res) {
    winston.info("[SSO] - crosslogin");

    var headers = req.headers;
    headers.host = config.ssoAuth.host;

    proxy.get({
        url: config.ssoAuth.baseUrl + req.url,
        headers: headers,
        proxy: config.proxy ? config.proxy.host : null,
        followRedirect: false
    }, function (err, resp, data) {
        if (err) {
            winston.error("[SSO] - crosslogin - error: ", err);
            return res.status(500);
        }

        var cookies = resp.headers["set-cookie"];
        var parsedCookie;

        for (var i = cookies.length - 1; i >= 0; i--) {
            parsedCookie = cookie.parse(cookies[i]);

            if (parsedCookie["CA.OVH.SES"]) {
                res.cookie("CA.OVH.SES", parsedCookie["CA.OVH.SES"], { path: "/", httpOnly: true });
            }
            if (parsedCookie.SESSION) {
                res.cookie("SESSION", parsedCookie.SESSION, { path: "/", httpOnly: true });
            }
            if (parsedCookie.USERID) {
                res.cookie("USERID", parsedCookie.USERID, { path: "/" });
            }
        }

        winston.info("[SSO] - Logged");

        res.redirect(resp.headers.location);
    });
}

export function auth (req, res) {
    let origin = req.headers.host;
    let protocol = req.protocol || "http";
    let headers = req.headers;
    headers.host = config.ssoAuth.host;
    proxy.post({
        url: config.ssoAuth.devLoginUrl,
        proxy: config.proxy ? config.proxy.host : null,
        headers: headers,
        followRedirect: false,
        gzip: true,
        json: {
            callbackUrl: `${protocol}://${origin}/auth/check`
        }
    }, (err, resp, data) => {

        if (err) {
            return res.status(500);
        }

        return res.redirect(data.data.url);
    });
}

export function checkAuth (req, res) {
    var headers = req.headers;
    headers.host = config.ssoAuth.host;

    let cookies = [];

    try {
        cookies = JSON.parse(base64url.decode(req.query.data));

        if (Array.isArray(cookies.cookies)) {
            cookies.cookies.forEach((c) => {

                let parsedCookie = cookie.parse(c);

                if (parsedCookie["CA.OVH.SES"]) {
                    res.cookie("CA.OVH.SES", parsedCookie["CA.OVH.SES"], { path: "/", httpOnly: true });
                }

                if (parsedCookie.SESSION) {
                    res.cookie("SESSION", parsedCookie.SESSION, { path: "/", httpOnly: true });
                }
                if (parsedCookie.USERID) {
                    res.cookie("USERID", parsedCookie.USERID, { path: "/" });
                }
            });
        }
    } catch (err) {
        console.error(err);
    }

    res.redirect("/");
}
