class CloudPoll {
    constructor ($q, $interval) {
        this.$q = $q;
        this.$interval = $interval;
    }

    //  Polling opts.  Contains items to poll, pollFunction callback, stopCondition callback and interval (optional, default 5000).
    //  Ex => { item: [1, 2, 3], pollFunction: item => doSomething(), stopCondition: item => doSomething(), interval: 10000  }
    pollArray (opts) {
        const poller = {};
        let items = opts.items;
        poller.pollInterval = this.$interval(() => {
            const promises = _.map(items, item =>
                this.$q.when(opts.pollFunction(item))
                    .then(newItem => {
                        if (newItem) {
                            _.merge(item, newItem.data ? newItem.data : newItem);
                        }

                        return this.$q.when(opts.stopCondition(item));
                    }).catch(() => { // If an error is encountered, we end the polling.
                        item = null;
                        return true;
                    })
                    .then(stopCondition => {
                        if (stopCondition) {
                            opts.onItemDone(item);
                        }

                        return {
                            stopping: stopCondition,
                            item
                        };
                    }));

            this.$q.all(promises)
                .then(results => {
                    items = _.map(_.filter(results, result => !result.stopping), result => result.item);

                    if (!items.length) {
                        poller.kill();
                    }
                });
        }, opts.interval || 5000);

        poller.kill = () => {
            this.$interval.cancel(poller.pollInterval);
        };

        return poller;
    }
}

angular.module("managerApp").service("CloudPoll", CloudPoll);
