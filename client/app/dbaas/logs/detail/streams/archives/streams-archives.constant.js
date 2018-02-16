angular.module("managerApp").constant("LogsStreamsArchivesConstant", {
    state: {
        SEALED: "sealed",
        UNSEALED: "unsealed",
        UNSEALING: "unsealing"
    },
    stateType: {
        sealed: "info",
        unsealed: "success",
        unsealing: "warning"
    },
    expirationInSeconds: 86400
});
