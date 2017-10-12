class CloudPoll {
    constructor ($q, $interval) {
        this.$q = $q;
        this.$interval = $interval;
    }

    //  Polling opts.  Contains items to poll, pollFunction callback, stopCondition callback and interval (optional, default 5000).
    //  Ex => { item: [1, 2, 3], pollFunction: item => doSomething(), stopCondition: item => doSomething(), interval: 10000  }
    pollArray (opts) {
        const poller = {};
        let continuePolling;
        let interval = 0;
        poller.pollInterval = this.$interval(() => {
            continuePolling = false;
            const promises = _.map(opts.items, item =>
                this.$q.when(opts.stopCondition(item))
                    .then(stopCondition => {
                        if (stopCondition && interval > 0) {
                            return this.$q.when();
                        }

                        continuePolling = true;
                        return this.$q.when(opts.pollFunction(item));
                    })
                    .then(newItem => {
                        if (newItem) {
                            _.merge(item, newItem.data ? newItem.data : newItem);
                        }
                    }));

            this.$q.all(promises)
                .then(() => {
                    if (!continuePolling) {
                        poller.kill();
                    }
                    interval++;
                })
                .catch(err => {
                    console.log(err);
                });
        }, opts.interval || 5000);

        poller.kill = () => {
            this.$interval.cancel(poller.pollInterval);
        };

        return poller;
    }
}

angular.module("managerApp").service("CloudPoll", CloudPoll);
