"use strict";

import {Router} from "express";
import {login} from "./sso.controller";
import {auth} from "./sso.controller";
import {checkAuth} from "./sso.controller";

var router = new Router();

router.get("/", auth);
router.get("/check", checkAuth);

export default router;
