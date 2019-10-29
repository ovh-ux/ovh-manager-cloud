import component from './vps-rebuild.component';
import routing from './vps-rebuild.routing';
import service from './vps-rebuild.service';

const moduleName = 'ovhManagerVpsRebuild';

angular
  .module(moduleName, [])
  .component(component.name, component)
  .config(routing)
  .service('vpsRebuild', service)
  .run(/* @ngTranslationsInject:json ./translations */);

export default moduleName;
