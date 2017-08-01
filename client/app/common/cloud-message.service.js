class CloudMessage {
    constructor ($state) {
        this.$state = $state;
        this.messages = {};
        this.subscribers = {};
    }

    success (message) {
        this.logMessage(_.isPlainObject(message) ? message : { text: message }, "success");
    }

    error (message) {
        this.logMessage(_.isPlainObject(message) ? message : { text: message }, "error");
    }

    warning (message) {
        this.logMessage(_.isPlainObject(message) ? message : { text: message }, "warning");
    }

    info (message) {
        this.logMessage(_.isPlainObject(message) ? message : { text: message }, "info");
    }

    logMessage (messageHash, type) {
        if (!messageHash.text) {
            return;
        }

        let stateName = `${this.$state.current.name}.`;
        const messageHandler = this.getMessageHandler(stateName);

        if (messageHandler) {
            messageHandler.messages.push(_.extend({ type }, messageHash));
            messageHandler.onMessage();
        } else {
            console.log(`Unhandled message ${messageHash.text}`);
        }
    }

    getMessageHandler (stateName) {
        let messageHandler = null;
        do {
            stateName = stateName.substring(0, _.lastIndexOf(stateName, "."));
            messageHandler = this.subscribers[stateName];
        } while (!messageHandler && _.includes(stateName, "."));
        return messageHandler;
    }

    getMessages (stateName) {
        return this.subscribers[stateName].messages;
    }

    flushMessages () {
        let stateName = `${this.$state.current.name}.`;
        const messageHandler = this.getMessageHandler(stateName);

        if (messageHandler) {
            messageHandler.messages = [];
            messageHandler.onMessage();
        }
    }

    unSubscribe (stateName) {
        const subscriber = this.subscribers[stateName];
        if (subscriber) {
            this.subscribers[stateName].messages = [];
            this.subscribers[stateName].onMessage();
        }
        this.subscribers = _.omit(this.subscribers, stateName);
    }

    subscribe (stateName, params) {
        this.subscribers[stateName] = _.extend({
            messages: [],
            onMessage: _.noop()
        }, params);
        return {
            getMessages: () => this.getMessages(stateName)
        };
    }
}

angular.module("managerApp").service("CloudMessage", CloudMessage);
