import { assert } from '../utils';
import { store } from '../store';
import type { Modules, ModulesReturnData } from '../modules';

export const workerAddModuleListener = <MN extends keyof Modules>(
  moduleName: MN,
  callback: (arg: Extract<ModulesReturnData, { moduleName: MN }>) => void
) => {
  const { sharedWorker } = store;
  assert(sharedWorker, 'Shared worker is undefined!');

  const listener = ({ data }: MessageEvent<ModulesReturnData>) => {
    if (data.moduleName !== moduleName) return;
    callback(data as Extract<ModulesReturnData, { moduleName: MN }>);
  };

  sharedWorker.port.addEventListener('message', listener);
  return () => sharedWorker.port.removeEventListener('message', listener);
};
