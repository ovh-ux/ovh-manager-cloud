angular.module("managerApp")
    .component("iplbZonePicker", {
        template: `
            <div data-ng-repeat="(country, zones) in $ctrl.zones.data | groupBy: 'country' | orderHashByKey track by $index">
                <p data-ng-bind="country"></p>
                <oui-checkbox 
                    on-change="$ctrl.onSelectionChanged(zone, modelValue)"
                    data-ng-repeat="zone in zones | orderBy: 'microRegion.text' track by $index" 
                    text="{{ zone.microRegion.text }}"></oui-checkbox>
            </div>`,
        controller:
            class {
                constructor () {
                    this.selections = [];
                }

                onSelectionChanged (selectedZone, value) {
                    let selection = _.find(this.selections, item => item.zone === selectedZone);
                    if (!selection) {
                        selection = {
                            zone: selectedZone,
                            selected: false
                        };
                        this.selections.push(selection);
                    }
                    selection.selected = value;

                    this.onSelectionChange({ value: _.map(_.filter(this.selections, item => item.selected), item => item.zone) });
                }
            },
        bindings: {
            zones: "<",
            onSelectionChange: "&?"
        }
    });
