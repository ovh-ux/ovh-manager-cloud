class CloudPoll {
    constructor ($transitions, OvhPoll) {
        this.OvhPoll = OvhPoll;

        this.pollers = [];

        $transitions.onSuccess({}, () => {
            _.forEach(this.pollers, poller => poller.kill());
            this.pollers = [];
        });
    }

    poll (opts) {
        const poller = this.OvhPoll.poll(opts);
        this.pollers.push(poller);
        return poller;
    }

    //  Polling opts.  Contains items to poll, pollFunction callback, stopCondition callback and interval (optional, default 5000).
    //  Ex => { item: [1, 2, 3], pollFunction: item => doSomething(), stopCondition: item => doSomething(), interval: 10000  }
    pollArray (opts) {
        const poller = this.OvhPoll.pollArray(opts);
        this.pollers.push(poller);
        return poller;
    }
}

angular.module("managerApp").service("CloudPoll", CloudPoll);
