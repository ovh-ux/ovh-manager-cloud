class AddRemovePanelCtrl {
    constructor ($q) {
        this.$q = $q;
        this.inProgress = false;
        this.init();
    }

    init () {
        //
    }

    add (index, item) {
        if (!this.inProgress && this.onAdd) {
            const defer = this.$q.defer();
            this.inProgress = true;
            this.onAdd({ item, defer, index });
            defer.promise.then(() => {
                this.sourceList.splice(index, 1);
                this.targetList.push(item);
                this.inProgress = false;
            }, () => {
                this.inProgress = false;
            });
        }
    }

    remove (index, item) {
        this.targetList.splice(index, 1);
        this.sourceList.push(item);
    }
}

angular.module("managerApp").controller("AddRemovePanelCtrl", AddRemovePanelCtrl);
