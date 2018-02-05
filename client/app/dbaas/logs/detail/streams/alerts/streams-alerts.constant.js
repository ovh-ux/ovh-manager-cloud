angular.module("managerApp").constant("LogsStreamsAlertsConstant", {
    alertType: {
        counter: "MESSAGE_COUNT",
        numeric: "FIELD_VALUE",
        textual: "FIELD_CONTENT_VALUE"
    },
    thresholdType: {
        more: "MORE",
        less: "LESS",
        lower: "LOWER",
        higher: "HIGHER"
    },
    constraintType: {
        mean: "MEAN",
        min: "MIN",
        max: "MAX",
        sum: "SUM",
        sd: "STDDEV"
    }
});
