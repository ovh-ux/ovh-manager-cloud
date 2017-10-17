class CloudDbDatabaseEditCtrl {
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
        this.databaseId = this.$stateParams.databaseId;

        this.defaultGrantValue = {
            grantId: "",
            databaseName: null,
            grantType: null
        };

        this.initModel();

        this.database = this.ControllerHelper.request.getHashLoader({
            loaderFunction: () => this.isInEdition() ? this.CloudDbDatabaseService.getDatabase(this.projectId, this.instanceId, this.databaseId) : this.$q.when({}),
            successHandler: () => {
                this.model.name.value = _.get(this.database, "data.name");

                const users = _.get(this.database, "data.users", []);
                this.model.users.value = users.length ? users : [_.clone(this.defaultGrantValue)];
            }
        });

        this.users = this.ControllerHelper.request.getArrayLoader({
            loaderFunction: () => this.CloudDbUserService.getUsers(this.projectId, this.instanceId)
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
            users: {
                value: [_.clone(this.defaultGrantValue)]
            }
        };
    }

    $onInit () {
        this.database.load();
        this.users.load();
        this.grantTypes.load();
        this.previousState = this.CloudNavigation.getPreviousState();
    }

    add () {
        if (this.form.$invalid) {
            return this.$q.reject();
        }

        this.CloudMessage.flushChildMessage();
        this.saving = true;
        return this.CloudDbDatabaseService.addDatabase(this.projectId, this.instanceId, this.extractModelValues())
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
        return this.CloudDbDatabaseService.saveDatabase(this.projectId, this.instanceId, this.databaseId, this.extractModelValues())
            .then(() => this.previousState.go())
            .finally(() => { this.saving = false; });
    }

    addUser () {
        this.model.users.value.push(_.clone(this.defaultGrantValue));
    }

    removeUser (index) {
        this.model.users.value.splice(index, 1);
    }

    isInEdition () {
        return this.databaseId;
    }

    extractModelValues () {
        const values = _.mapValues(this.model, modelKey => modelKey.value);
        values.users = _.filter(values.users, user => user.grantId || (user.userName && user.grantType));
        return values;
    }

    getAvailableUser (forceValue) {
        const filteredValue = _.filter(this.users.data, user => !_.includes(_.map(this.model.users.value, value => value.userName), user.name));
        if (forceValue) {
            filteredValue.push(_.find(this.users.data, user => user.name === forceValue));
        }
        return filteredValue;
    }

    canAddUser () {
        const availableUserCount = this.getAvailableUser().length;
        return availableUserCount > 0 && this.model.users.value.length < this.users.data.length;
    }
}

angular.module("managerApp").controller("CloudDbDatabaseEditCtrl", CloudDbDatabaseEditCtrl);
