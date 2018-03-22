angular.module("managerApp").constant("LogsInputsConstant", {
    status: {
        PROCESSING: "PROCESSING",
        INIT: "INIT",
        PENDING: "PENDING",
        RUNNING: "RUNNING"
    },
    state: {
        PROCESSING: "processing",
        RESTART_REQUIRED: "restart_required",
        TO_CONFIGURE: "to_configure",
        PENDING: "pending",
        RUNNING: "running",
        UNKNOWN: "unknown"
    },
    stateType: {
        processing: "info",
        restart_required: "info",
        to_configure: "warning",
        pending: "info",
        running: "success",
        unknown: "error"
    },
    FAILURE: "FAILURE",
    SUCCESS: "SUCCESS",
    DEFAULT_PORT: 6514,
    optionType: "logs-input"
});
