(() => {
    "use strict";

    class CuiMessageContainerCtrl {
        constructor ($scope) {
            this.$scope = $scope;
            this.messages = this.messages || [];
        }

        $onInit () {
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

        refreshMessageOrder () {
            let messageOrder = 0;
            _.forEachRight(this.messages, message => {
                message.messageOrder = messageOrder++;
            });
        }

        getGroupedMessages () {
            const messagePriorities = {
                error: 1,
                warning: 2,
                info: 3,
                success: 4
            };

            const groupedMessages = _.groupBy(this.messages, "type");
            return _.map(_.keys(groupedMessages), key => ({
                key,
                values: this.extractUniqueMessage(groupedMessages[key]),
                isGroupable: key === "error",
                priority: messagePriorities[key]
            }));
        }

        extractUniqueMessage (messageList) {
            const groupedMessages = _.groupBy(messageList, message => message.text || message.textHtml);
            return _.map(_.keys(groupedMessages), key => ({
                text: groupedMessages[key][0].text,
                textHtml: groupedMessages[key][0].textHtml,
                messageOrder: groupedMessages[key][0].messageOrder,
                type: groupedMessages[key][0].type,
                link: groupedMessages[key][0].link,
                dismissed: groupedMessages[key][0].dismissed // It's important to take last message's property since we always wanna show new message,
                                                             // even if an exact copy was dismissed before.
            }));
        }

        onDismiss (message) {
            message.dismissed = true;
        }
    }

    angular.module("managerApp")
        .component("cuiMessageContainer", {
            templateUrl: "app/ui-components/message/message-container.html",
            controller: CuiMessageContainerCtrl,
            bindings: {
                messages: "<"
            }
        });

    angular.module("managerApp").controller("CuiMessageContainerCtrl", CuiMessageContainerCtrl);
})();
