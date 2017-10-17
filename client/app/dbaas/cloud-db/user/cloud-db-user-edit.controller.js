class CloudDbUserEditCtrl {
    constructor ($q, $stateParams, CloudDbDatabaseService, CloudDbGrantService, CloudDbUserService, CloudMessage, CloudNavigation, ControllerHelper) {
        this.$q = $q;
        this.$stateParams = $stateParams;
        this.CloudDbDatabaseService = CloudDbDatabaseService;
        this.CloudDbGrantService = CloudDbGrantService;
        this.CloudDbUserService = CloudDbUserService;
        this.CloudMessage = CloudMessage;
        this.CloudNavigation = CloudNavigation;
        this.ControllerHelper = ControllerHelper;

        this.projectId = this.$stateParams.projectId;
        this.instanceId = this.$stateParams.instanceId;
        this.userId = this.$stateParams.userId;

        this.defaultGrantValue = {
            grantId: "",
            databaseName: null,
            grantType: null
        };

        this.initModel();

        this.user = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.isInEdition() ? this.CloudDbUserService.getUser(this.projectId, this.instanceId, this.userId) : this.$q.when({}),
            successHandler: () => {
                this.model.name.value = _.get(this.user, "data.name");

                //  We don't set password fields in edition.  It's a secret and should not be displayed.
                const databases = _.get(this.user, "data.databases", []);
                this.model.databases.value = databases.length ? databases : [_.clone(this.defaultGrantValue)];
            }
        });

        this.databases = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.CloudDbDatabaseService.getDatabases(this.projectId, this.instanceId)
        });

        this.grantTypes = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.CloudDbGrantService.getGrantTypes()
        });
    }

    initModel () {
        this.model = {
            name: {
                value: "",
                maxLength: Infinity,
                required: true
            },
            password: {
                value: "",
                maxLength: Infinity,
                required: true
            },
            databases: {
                value: [_.clone(this.defaultGrantValue)]
            }
        };
    }

    $onInit () {
        this.user.load();
        this.databases.load();
        this.grantTypes.load();
        this.previousState = this.CloudNavigation.getPreviousState();
    }

    add () {
        if (this.form.$invalid) {
            return this.$q.reject();
        }

        this.CloudMessage.flushChildMessage();
        this.saving = true;
        return this.CloudDbUserService.addUser(this.projectId, this.instanceId, this.extractModelValues())
            .then(() => {
                this.previousState.go();
            })
            .finally(() => { this.saving = false; });
    }

    update () {
        if (this.form.$invalid) {
            return this.$q.reject();
        }

        this.CloudMessage.flushChildMessage();
        this.saving = true;
        return this.CloudDbUserService.saveUser(this.projectId, this.instanceId, this.userId, this.extractModelValues())
            .then(() => this.previousState.go())
            .finally(() => { this.saving = false; });
    }

    addDatabase () {
        this.model.databases.value.push(_.clone(this.defaultGrantValue));
    }

    removeDatabase (index) {
        this.model.databases.value.splice(index, 1);
    }

    isInEdition () {
        return this.userId;
    }

    extractModelValues () {
        const values = _.mapValues(this.model, modelKey => modelKey.value);
        values.databases = _.filter(values.databases, database => database.grantId || (database.databaseName && database.grantType));
        return values;
    }

    getAvailableDatabase (forceValue) {
        const filteredValue = _.filter(this.databases.data, database => !_.includes(_.map(this.model.databases.value, value => value.databaseName), database.name));
        if (forceValue) {
            filteredValue.push(_.find(this.databases.data, database => database.name === forceValue));
        }
        return filteredValue;
    }

    canAddDatabase () {
        const availableDatabaseCount = this.getAvailableDatabase().length;
        return availableDatabaseCount > 0 && this.model.databases.value.length < this.databases.data.length;
    }
}

angular.module("managerApp").controller("CloudDbUserEditCtrl", CloudDbUserEditCtrl);
