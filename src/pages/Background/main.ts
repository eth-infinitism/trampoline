import { RootState } from './redux-slices';
import KeyringService from './services/keyring';
import MainServiceManager, {
  MainServiceManagerServicesMap,
} from './services/main';
import ProviderBridgeService from './services/provider-bridge';
import Config from '../../exconfig.json';
console.debug('---- LAUNCHING WITH CONFIG ----', Config);

chrome.runtime.onInstalled.addListener((e) => {
  if (e.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    const url = chrome.runtime.getURL('app.html');
    chrome.tabs.create({
      url,
    });
  }
});

const serviceInitializer = async (
  mainServiceManager: MainServiceManager
): Promise<MainServiceManagerServicesMap> => {
  const storeState: RootState = mainServiceManager.store.getState();

  const keyringService = await KeyringService.create({
    mainServiceManager: mainServiceManager,
    initialState: storeState.keyrings.vault,
    provider: storeState.network.activeNetwork.provider || '',
    bundler: storeState.network.activeNetwork.bundler || '',
    entryPointAddress: storeState.network.activeNetwork.entryPointAddress,
  });

  const providerBridgeService = await ProviderBridgeService.create({
    mainServiceManager,
  });

  return {
    [KeyringService.name]: keyringService,
    [ProviderBridgeService.name]: providerBridgeService,
  };
};

/**
 * Starts the API subsystems, including all services.
 */
export default async function startMain(): Promise<MainServiceManager> {
  const mainService = await MainServiceManager.create(
    'background',
    serviceInitializer
  );
  mainService.startService();
  return mainService.started();
}
