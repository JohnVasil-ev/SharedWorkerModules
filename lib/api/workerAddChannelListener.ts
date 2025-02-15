import { assert } from '../utils';
import { store } from '../store';
import type { ChannelData } from '../lib';
import type { Modules } from '../modules';

export const workerAddChannelListener = <
  MN extends keyof Modules,
  MCO extends Modules[MN]['channels'],
  MC extends keyof MCO,
  A extends MCO[MC]
>(
  moduleName: MN,
  moduleChannel: MC,
  callback: (
    data: A extends (arg: ChannelData<infer R, any>) => any ? R : never
  ) => void
) => {
  const { clientId, sharedWorker } = store;
  assert(sharedWorker, 'Shared worker is undefined!');
  assert(clientId, 'Client id is undefined!');

  const listener = ({ data }: MessageEvent<any>) => {
    if (
      data.moduleName !== moduleName ||
      data.moduleChannel !== moduleChannel
    ) {
      return;
    }

    callback(
      data.payload as A extends (arg: ChannelData<infer R, any>) => any
        ? R
        : never
    );
  };

  sharedWorker.port.addEventListener('message', listener);
  return () => sharedWorker.port.removeEventListener('message', listener);
};
