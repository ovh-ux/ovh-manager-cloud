(() => {
    class CloudProjectOpenstackCtrl {
    	constructor ($state, CloudMessage) {
    		this.$state = $state;
    		this.CloudMessage = CloudMessage;

    		this.messages = [];
    	}

    	$onInit () {
    		this.$state.go("iaas.pci-project.openstack.users");
    		this.loadMessages();
    	}

    	loadMessages () {
            this.CloudMessage.unSubscribe("iaas.pci-project.openstack");
            this.messageHandler = this.CloudMessage.subscribe("iaas.pci-project.openstack", { onMessage: () => this.refreshMessage() });
        }

    	refreshMessage () {
            this.messages = this.messageHandler.getMessages();
        }
    }

	angular.module("managerApp").controller("CloudProjectOpenstackCtrl", CloudProjectOpenstackCtrl);
})();
