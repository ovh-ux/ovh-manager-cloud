class InlineAdderCtrl {
    constructor ($q, $element) {
        this.$q = $q;
        this.$element = $element;

        this.inlineItemsLoading = false;
    }

    $onInit () {
        this.inlineItems = this.inlineItems || [];
        this.property = this.property || [];
        this.onAdd = this.onAdd || null;
        this.onRemove = this.onRemove || null;

        this.loadInlineItems();
    }

    loadInlineItems () {
        if (this.inlineItemsLoading) {
            return this.$q.reject(false);
        }
        this.inlineItemsLoading = true;
        return this.$q.when(this.inlineItems)
            .then(item => {
                console.log("input", item);
                this.inlineItems = this.getProperty(item);
                console.log("inlineItems", this.inlineItems);
            })
            .finally(() => {
                this.inlineItemsLoading = false;
            });
    }

    getProperty (item) {
        if (!this.property) {
            return item;
        }
        return this.property.split(".").reduce((prev, curr) => prev ? prev[curr] : undefined, item);
    }
}

angular.module("managerApp").controller("InlineAdderCtrl", InlineAdderCtrl);
