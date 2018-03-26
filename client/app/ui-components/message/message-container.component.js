(() => {
    "use strict";

    class UniqueMessageComposite {
        constructor (messageList) {
            this.messageList = messageList;
            this.text = messageList[0].text;
            this.textHtml = messageList[0].textHtml;
            this.messageOrder = messageList[0].messageOrder;
            this.type = messageList[0].type;
            this.link = messageList[0].link;
            this.dismissable = messageList[0].dismissable;
            this.dismissed = !_.some(this.messageList, message => !message.dismissed);
        }

        dismiss () {
            this.dismissed = true;
            _.forEach(this.messageList, message => {
                message.dismissed = true;
                if (_.isFunction(message.dismiss)) {
                    message.dismiss();
                }
            });
        }
    }

    class CuiMessageContainerCtrl {
        constructor ($scope) {
            this.$scope = $scope;
        }

        $onInit () {
            this.messages = this.messages || [];
            this.dismissableTypes = this.dismissableTypes || ["info", "success"];
            this.groupedTypes = this.groupedTypes || ["error"];

            this.$scope.$watchCollection(() => this.messages, () => {
                this.refreshValues();
                this.groupedMessages = this.getGroupedMessages();
            });
        }

        shouldDisplayGroupedMessages (messageCategory) {
            return _.filter(messageCategory.values, value => !value.dismissed).length !== 1 && messageCategory.isGroupable;
        }

        hasMessageToDisplay () {
            return this.messages.length;
        }

        hasGroupMessageToDisplay (type) {
            const messageGroup = _.find(this.groupedMessages, group => group.key === type);
            return _.some(messageGroup.values, value => !value.dismissed);
        }

        refreshValues () {
            let messageOrder = 0;

            _.forEachRight(this.messages, message => {
                if (!_.contains([true, false], message.dismissed)) {
                    message.dismissed = false;
                }

                message.dismissable = this.isDismissable(message.type);

                message.messageOrder = messageOrder++;
            });
        }

        getGroupedMessages () {
            const groupedMessages = _.groupBy(this.messages, "type");

            const messagePriorities = {
                error: 1,
                warning: 2,
                info: 3,
                success: 4
            };

            return _.map(_.keys(groupedMessages), key => ({
                key,
                values: this.extractUniqueMessage(groupedMessages[key]),
                isGroupable: this.isGroupable(key),
                priority: messagePriorities[key],
                dismissable: this.isDismissable(key)
            }));
        }

        isGroupable (type) {
            return _.contains(this.groupedTypes, type);
        }

        isDismissable (type) {
            return _.contains(this.dismissableTypes, type);
        }

        extractUniqueMessage (messageList) {
            const groupedMessages = _.groupBy(messageList, message => message.text || message.textHtml);
            const groupedMessagesHash = _.map(_.keys(groupedMessages), key => new UniqueMessageComposite(groupedMessages[key]));
            return groupedMessagesHash;
        }

        onDismiss (message) {
            message.dismiss();
        }

        onGroupDismiss (groupedMessages) {
            _.forEach(groupedMessages.values, message => message.dismiss());
        }
    }

    angular.module("managerApp")
        .component("cuiMessageContainer", {
            templateUrl: "app/ui-components/message/message-container.html",
            controller: CuiMessageContainerCtrl,
            bindings: {
                messages: "<",
                groupedTypes: "<",
                dismissableTypes: "<"
            }
        });

    angular.module("managerApp").controller("CuiMessageContainerCtrl", CuiMessageContainerCtrl);
})();
