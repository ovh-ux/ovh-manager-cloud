class CloudMessage {
    constructor ($state) {
        this.$state = $state;
        this.messages = {};
        this.subscribers = {};
    }

    success (message, containerName) {
        this.logMessage(_.isPlainObject(message) ? message : { text: message }, "success", containerName);
    }

    error (message, containerName) {
        this.logMessage(_.isPlainObject(message) ? message : { text: message }, "error", containerName);
    }

    warning (message, containerName) {
        this.logMessage(_.isPlainObject(message) ? message : { text: message }, "warning", containerName);
    }

    info (message, containerName) {
        this.logMessage(_.isPlainObject(message) ? message : { text: message }, "info", containerName);
    }

    logMessage (messageHash, type, containerName) {
        if (!messageHash.text) {
            return;
        }

        const messageHandler = this.getMessageHandler(containerName);

        if (messageHandler) {
            messageHandler.messages.push(_.extend({ type }, messageHash));
            messageHandler.onMessage();
        } else {
            console.log(`Unhandled message ${messageHash.text}`);
        }
    }

    getMessageHandler (containerName) {
        containerName = `${containerName || this.$state.current.name}.`;
        let messageHandler = null;
        do {
            containerName = containerName.substring(0, _.lastIndexOf(containerName, "."));
            messageHandler = this.subscribers[containerName];
        } while (!messageHandler && _.includes(containerName, "."));
        return messageHandler;
    }

    getMessages (containerName) {
        return this.subscribers[containerName].messages;
    }

    flushMessages (containerName) {
        const messageHandler = this.getMessageHandler(containerName);

        if (messageHandler) {
            messageHandler.messages = [];
            messageHandler.onMessage();
        }
    }

    unSubscribe (containerName) {
        const subscriber = this.subscribers[containerName];
        if (subscriber) {
            this.subscribers[containerName].messages = [];
            this.subscribers[containerName].onMessage();
        }
        this.subscribers = _.omit(this.subscribers, containerName);
    }

    subscribe (containerName, params) {
        this.subscribers[containerName] = _.extend({
            messages: [],
            onMessage: _.noop()
        }, params);
        return {
            getMessages: () => this.getMessages(containerName)
        };
    }
}

angular.module("managerApp").service("CloudMessage", CloudMessage);
