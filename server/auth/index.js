"use strict";

import express from "express";
import config from "../config/environment";

var router = express.Router();

//router.use(/^\/cgi-bin\/crosslogin.cgi/, require("./sso").default);
router.use(/^\/auth/, require("./sso").default);

export default router;
