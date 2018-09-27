class VpsCloudDatabaseCtrl {
    constructor ($q /* , CloudDatabase */) {
        this.$q = $q;
        // this.CloudDatabase = CloudDatabase;
    }

    refresh () {
        // this.CloudDatabase.getAll().then(databases => {
        //     this.cloudDatabases = databases;
        // });
        return this.$q.when()
            .then(() => [1, 2, 3])
            .then(ids => ({
                data: ids ? _.map(ids, id => ({ id })) : [],
                meta: { totalCount: ids ? ids.length : 0 }
            }));
    }

    transformItem (row) {
        return this.$q.when().then(() => ({
            name: `Database ${row.id}`,
            type: "MariaDb",
            status: "created"
        }));
    }
}

angular.module("managerApp").controller("VpsCloudDatabaseCtrl", VpsCloudDatabaseCtrl);
