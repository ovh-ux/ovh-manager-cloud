{
    class AnnouncementMessageController {
        constructor (announcementMessage) {
            this.announcementMessage = announcementMessage;
        }

        $onInit () {
            this.currentDate = moment();
            this.componentIsEnabled = false;

            this.confirmIsValid();
            this.activateComponent();
            this.testPreferencesAllowOpening();
        }

        confirmIsValid () {
            if (_.isEmpty(this.preferenceName)) {
                throw new Error("announcementMessage component cannot work without an id");
            }

            const hasDuration = _.isNumber(this.durationInDays);
            const hasStartDate = _.isString(this.startDate);
            if (hasDuration && !hasStartDate) {
                throw new Error("announcementMessage component should have a start date if it has a duration");
            }

            const hasEndDate = _.isString(this.endDate);
            if (hasDuration && hasEndDate) {
                throw new Error("announcementMessage component cannot have a duration and an end date");
            }

            if (hasStartDate && hasEndDate) {
                if (hasDuration && moment(this.startDate).add(this.durationInDays, "days").isSameOrBefore(this.endDate) || moment(this.endDate).isSameOrBefore(this.startDate)) {
                    throw new Error("announcementMessage component end date should be after the start date");
                }
            }
        }

        activateComponent () {
            const hasEndDate = _.isString(this.endDate);
            const shouldDisplayAccordingToEndDate = !hasEndDate || moment(this.endDate).isAfter(this.currentDate, "day");

            const hasDuration = _.isNumber(this.durationInDays);
            const shouldDisplayAccordingToDuration = !hasDuration || moment(this.startDate).add(this.durationInDays, "days").isSameOrAfter(this.currentDate, "day");

            const hasStartDate = _.isString(this.startDate);
            const shouldDisplayAccordingToStartDate = !hasStartDate || moment(this.startDate).isSameOrBefore(this.currentDate, "day");

            this.componentIsEnabled = shouldDisplayAccordingToEndDate && shouldDisplayAccordingToStartDate && shouldDisplayAccordingToDuration;
        }

        testPreferencesAllowOpening () {
            return this.announcementMessage
                .fetchPreferencsAllowingOpening(this.preferenceName)
                .then(preferenceAllowOpening => {
                    this.componentIsEnabled = preferenceAllowOpening;
                });
        }

        preventOpeningNextTime () {
            return this.announcementMessage.createPreferenceToPreventOpeningNextTime(this.preferenceName);
        }
    }

    angular
        .module("managerApp")
        .component("announcementMessage", {
            templateUrl: "app/common/announcementMessage/announcementMessage.html",
            bindings: {
                startDate: "@?",
                endDate: "@?",
                durationInDays: "<?",
                preferenceName: "@"
            },
            transclude: true,
            controller: AnnouncementMessageController
        });
}
