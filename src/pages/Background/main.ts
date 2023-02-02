import { RootState } from './redux-slices';
import KeyringService from './services/keyring';
import MainServiceManager, {
  MainServiceManagerServicesMap,
} from './services/main';

chrome.runtime.onInstalled.addListener((e) => {
  if (e.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    const url = chrome.runtime.getURL('src/app/index.html#onboarding/intro');
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
    entryPointAddress: storeState.network.activeNetwork.entryPointAddress,
  });
  return {
    [KeyringService.name]: keyringService,
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
