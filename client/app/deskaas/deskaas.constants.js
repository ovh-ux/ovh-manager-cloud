"use strict";

angular.module("managerApp")
  .constant("ACTIONS", {
      "RESTORE": "refreshVirtualDesktop",
      "REBOOT": "restartVirtualDesktop",
      "DELETE": "removeVirtualDesktop",
      "UPGRADE": "upgradeVirtualDesktop",
      "SUSPEND": "suspendVirtualDesktop",
      "UPDATE_ALIAS": "setAliasOnVirtualDesktop",
      "UPDATE_USERNAME": "updateUsername",
      "OPEN": "openVirtualDesktop",
      "UPDATE_USER_PWD": "updateUserPassword",
      "CONSOLE_ACCESS": "getConsoleAccess"
  });
