class CloudNavigation {
    constructor ($rootScope, $state, $stateParams, TabsService) {
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.TabsService = TabsService;

        $rootScope.$on("$stateChangeSuccess", (event, toState, toParams, fromState, fromParams) => {
            const correspondingState = _.find(this.history, state => state.name === toState.name && _.isEqual(state.stateParams, toParams));

            if (correspondingState) {
                while (_.last(this.history) !== correspondingState) { this.history.pop(); }
                this.history.pop();
            } else {
                this.history.push({ name: fromState.name, stateParams: fromParams, sref: this.getSref(fromState, fromParams) });
            }
        });
    }

    $onInit () {
        this.init();
    }

    init (rootElement) {
        this.history = [];
        if (rootElement) {
            this.history.push({ name: rootElement.state, stateParams: rootElement.stateParams, sref: this.getSref(this.$state.get(rootElement.state), rootElement.stateParams) });
        }
    }

    forceHistory (element) {
        this.history.push({ name: element.state, stateParams: element.stateParams, sref: this.getSref(this.$state.get(element.state), element.stateParams) });
    }

    getPreviousState () {
        const activeTab = this.TabsService.getActiveTab();
        const previousState = _.assign({}, _.last(this.history) || { name: activeTab.state, stateParams: activeTab.stateParams, sref: activeTab.sref });
        previousState.go = () => this.$state.go(previousState.name, previousState.stateParams);
        return previousState;
    }

    getSref (state, params) {
        return `${state.name}(${JSON.stringify(params)})`;
    }
}

angular.module("managerApp").service("CloudNavigation", CloudNavigation);
