class TabsService {
    constructor ($transitions, $state) {
        this.$state = $state;

        this.registeredTabs = [];
        this.activeTab = undefined;

        $transitions.onSuccess({}, () => {
            this.refreshActiveTab();
        });
    }

    $onInit () {
        this.init();
    }

    init () {
        this.registeredTabs = [];
    }

    getRegisteredTabs () {
        return this.registeredTabs;
    }

    registerTab (tab) {
        const existingTab = _.find(this.registeredTabs, existing => tab.state === existing.state && tab.text === existing.text);
        if (existingTab) {
            this.expandTab(tab);

            //ugly.  This should be event driven.
            tab.updateActive(existingTab.active, existingTab.isActivating);
            this.registeredTabs[_.indexOf(this.registeredTabs, existingTab)] = tab;
        } else {
            this.expandTab(tab);
            this.registeredTabs.push(tab);
            this.refreshActiveTab();
        }
    }

    expandTab (tab) {
        tab.active = tab.active ? tab.active : false;
        tab.isActivating = tab.isActivating ? tab.isActivating : false;
        tab.sref = `${tab.state}(${JSON.stringify(tab.stateParams)})`;
    }

    refreshActiveTab () {
        const previousActiveTab = _.find(this.registeredTabs, tab => tab.active);

        // ActiveTab is determined in this order =>
        //  1- We check if the current state fit with one of the tabs' state.  (Direct state reference or it's children).  We activate the corresponding tab.
        //  2- We are in the presence of an orphan state (no tab corresponds to the state).  We try to find the current active and make sure is is active.
        //  3- If, however, no tabs are active, we activate the first tab.
        const newActiveTab = _.find(this.registeredTabs, tab => tab.state && this.$state.includes(tab.state)) || previousActiveTab || this.registeredTabs[0];

        if (newActiveTab && previousActiveTab !== newActiveTab) {
            if (previousActiveTab) {
                previousActiveTab.updateActive(false, false);
            }

            newActiveTab.updateActive(true, true);
        }

        // We make sure to keep the same activeTab instance.  This way, we can watch value change to know when active tab changed.
        if (newActiveTab && !this.activeTab) {
            this.activeTab = {};
        }

        _.extend(this.activeTab, newActiveTab);
    }

    getActiveTab () {
        if (this.registeredTabs.length) {
            return this.activeTab;
        }

        return undefined;
    }
}

angular.module("managerApp").service("TabsService", TabsService);
