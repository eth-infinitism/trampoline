import { wrapStore } from 'webext-redux';
import { initializeStore, ReduxStoreType } from '../redux-slices';
import BaseService from './base';

export interface MainServiceManagerServicesMap {
  [key: string]: BaseService<any>;
}

export interface MainServiceManagerProps {
  services: MainServiceManagerServicesMap;
}

export default class MainServiceManager extends BaseService<never> {
  store: ReduxStoreType;
  services?: MainServiceManagerServicesMap;

  constructor(readonly name: string) {
    super();
    this.store = initializeStore(this);
    wrapStore(this.store);
  }

  init = async (props: MainServiceManagerProps) => {
    this.services = props.services;
  };

  static async create(
    name: string,
    serviceInitializer: (
      mainServiceManager: MainServiceManager
    ) => Promise<MainServiceManagerServicesMap>
  ) {
    const mainServiceManager = new this(name);

    await mainServiceManager.init({
      services: await serviceInitializer(mainServiceManager),
    });

    return mainServiceManager;
  }

  getService = (name: string): BaseService<any> => {
    if (!this.services) throw new Error('No services initialised');
    return this.services[name];
  };

  _startService = async (): Promise<void> => {
    if (!this.services) throw new Error('No services initialised');
    Object.values(this.services).map((service) => service.startService());
  };
  _stopService = async (): Promise<void> => {
    if (!this.services) throw new Error('No services initialised');
    Object.values(this.services).map((service) => service.stopService());
  };
}
