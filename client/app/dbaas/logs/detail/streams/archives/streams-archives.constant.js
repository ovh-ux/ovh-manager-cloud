angular.module("managerApp").constant("LogsStreamsArchivesConstant", {
    state: {
        SEALED: "sealed",
        UNSEALED: "unsealed",
        UNSEALING: "unsealing"
    },
    stateInfo: {
        sealed: "Frozen",
        unsealed: "Available",
        unsealing: "Unfreezing"
    },
    expirationInSeconds: 86400
});
