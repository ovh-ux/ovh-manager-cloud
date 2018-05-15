class LogsListHeaderCtrl {
    constructor ($translate, LogsConstants, ovhDocUrl) {
        this.$translate = $translate;
        this.LogsConstants = LogsConstants;
        this.ovhDocUrl = ovhDocUrl;
    }

    $onInit () {
        this.initGuides();
    }

    initGuides () {
        this.guides = {};
        this.guides.title = this.$translate.instant("logs_guides");
        this.guides.list = [{
            name: this.$translate.instant("logs_guides_title"),
            url: this.ovhDocUrl.getDocUrl(this.LogsConstants.LOGS_DOCS_NAME)
        }];
        this.guides.footer = this.$translate.instant("logs_guides_footer");
    }
}

angular.module("managerApp").controller("LogsListHeaderCtrl", LogsListHeaderCtrl);
