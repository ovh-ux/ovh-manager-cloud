(() => {
    "use strict";

    class CuiMessageContainerCtrl {
        constructor ($scope) {
            this.$scope = $scope;
            this.messages = this.messages || [];
        }

        $onInit () {
            if (!this.groupedTypes) {
                this.groupedTypes = ["error"];
            }
            this.$scope.$watch(() => this.messages.length, () => {
                this.refreshMessageOrder();
                this.groupedMessages = this.getGroupedMessages();
            });
        }

        shouldDisplayGroupedMessages (messageCategory) {
            return messageCategory.values.length !== 1 && messageCategory.isGroupable;
        }

        hasMessageToDisplay () {
            return this.messages.length;
        }

        hasGroupMessageToDisplay (type) {
            const messageGroup = _.find(this.groupedMessages, group => group.key === type);
            return _.some(messageGroup.values, value => !value.dismissed);
        }

        refreshMessageOrder () {
            let messageOrder = 0;
            _.forEachRight(this.messages, message => {
                message.messageOrder = messageOrder++;
            });
        }

        getGroupedMessages () {
            const groupedMessages = _.groupBy(this.messages, "type");
            return this.groupMessagesByType(groupedMessages, this.groupedTypes, this.dismissableTypes);
        }

        groupMessagesByType (groupedMessages, types, dismissableTypes) {
            const messagePriorities = {
                error: 1,
                warning: 2,
                info: 3,
                success: 4
            };

            return _.map(_.keys(groupedMessages), key => ({
                key,
                values: this.extractUniqueMessage(groupedMessages[key]),
                isGroupable: _.contains(types, key),
                priority: messagePriorities[key],
                dismissable: this.isDismissable(dismissableTypes, key)
            }));
        }

        isDismissable (dismissableTypes, type) {
            return _.contains(dismissableTypes, type);
        }

        extractUniqueMessage (messageList) {
            const groupedMessages = _.groupBy(messageList, message => message.text || message.textHtml);

            const groupedMessagesHash = _.map(_.keys(groupedMessages), key => ({
                text: groupedMessages[key][0].text,
                textHtml: groupedMessages[key][0].textHtml,
                messageOrder: groupedMessages[key][0].messageOrder,
                messages: groupedMessages[0],
                type: groupedMessages[key][0].type,
                link: groupedMessages[key][0].link,
                dismissable: this.isDismissable(this.dismissableTypes, groupedMessages[key][0].type),
                dismissed: groupedMessages[key][0].dismissed // It's important to take last message's property since we always wanna show new message, 
                // even if an exact copy was dismissed before.
            }));
            return groupedMessagesHash;
        }

        onDismiss (message) {
            message.dismissed = true;
        }

        onGroupDismiss (groupedMessages) {
            _.forEach(groupedMessages.values, message => this.onDismiss(message));
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
