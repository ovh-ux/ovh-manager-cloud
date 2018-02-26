class InlineAdderItemCtrl {
    constructor ($q, $element) {
        this.$q = $q;
        this.$element = $element;
    }

    $onInit () {
        this.items = this.items || [];
        console.log("item", this.item);
    }
}

angular.module("managerApp").controller("InlineAdderItemCtrl", InlineAdderItemCtrl);
