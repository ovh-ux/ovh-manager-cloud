class CloudNavigation {
    constructor ($rootScope, $state, $stateParams, TabsService) {
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.TabsService = TabsService;

        $rootScope.$on("$stateChangeSuccess", (event, toState, toParams, fromState, fromParams) => {
            const correspondingState = _.find(this.history, elem => elem.state === toState.name && _.isEqual(elem.stateParams, toParams));

            if (correspondingState) {
                while (_.last(this.history) !== correspondingState) { this.history.pop(); }
                this.history.pop();
            } else {
                const element = { state: fromState.name, stateParams: fromParams, sref: this.getSref({ state: fromState.name }, fromParams) };
                this.history.push(element);
            }
        });
    }

    $onInit () {
        this.init();
    }

    init (rootElement) {
        this.history = [];
        if (rootElement) {
            this.history.push({ state: rootElement.state, stateParams: rootElement.stateParams, sref: this.getSref(rootElement, rootElement.stateParams) });
        }

        const activeTabState = this.getActiveTabState();
        if (activeTabState) {
            this.history.push(activeTabState);
        }
    }

    getPreviousState () {
        const previousState = _.assign({}, _.last(this.history) || this.getActiveTabState());
        previousState.go = () => this.$state.go(previousState.state, previousState.stateParams);
        return previousState;
    }

    getActiveTabState () {
        const activeTab = this.TabsService.getActiveTab();

        if (!activeTab) {
            return undefined;
        }

        return { state: activeTab.state, stateParams: activeTab.stateParams, sref: activeTab.sref };
    }

    findInHistory (stateToFind) {
        return _.find(this.history, state => state.state === stateToFind.state && _.isEqual(state.stateParams, stateToFind.stateParams));
    }

    getSref (element, params) {
        return `${element.state}(${JSON.stringify(params)})`;
    }
}

angular.module("managerApp").service("CloudNavigation", CloudNavigation);
