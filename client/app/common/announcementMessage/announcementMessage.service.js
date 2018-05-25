{
    class AnnouncementMessage {
        constructor (ovhUserPref) {
            this.ovhUserPref = ovhUserPref;
        }

        fetchPreferencsAllowingOpening (preferenceName) {
            return this.ovhUserPref
                .getValue(preferenceName)
                .then(() => false)
                .catch(error => {
                    if (error.status === 404) {
                        return true;
                    }

                    return this.$q.reject(error);
                });
        }

        createPreferenceToPreventOpeningNextTime (preferenceName) {
            return this.ovhUserPref.create(preferenceName, true);
        }
    }

    angular
        .module("managerApp")
        .service("announcementMessage", AnnouncementMessage);
}
