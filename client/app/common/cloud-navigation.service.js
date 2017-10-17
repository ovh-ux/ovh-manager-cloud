class CloudNavigation {
    constructor ($rootScope, $state, $stateParams, TabsService) {
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.TabsService = TabsService;

        this.rootElement = undefined;

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
        this.rootElement = undefined;
        if (rootElement) {
            this.rootElement = rootElement;
        }
    }

    getPreviousState () {
        const previousState = _.last(this.history) || this.getActiveTabState() || this.rootElement;
        previousState.go = () => this.$state.go(previousState.state, previousState.stateParams);
        return previousState;
    }

    getActiveTabState () {
        return this.TabsService.getActiveTab();
    }

    findInHistory (stateToFind) {
        return _.find(this.history, state => state.state === stateToFind.state && _.isEqual(state.stateParams, stateToFind.stateParams));
    }

    getSref (element, params) {
        return `${element.state}(${JSON.stringify(params)})`;
    }
}

angular.module("managerApp").service("CloudNavigation", CloudNavigation);
