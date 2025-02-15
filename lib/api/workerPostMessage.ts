import { assert } from '../utils';
import { store } from '../store';
import type { EventData } from '../lib';
import type { Modules } from '../modules';

export const workerPostMessage =
  <
    MN extends keyof Modules,
    ME extends keyof Modules[MN]['actions'],
    A extends Modules[MN]['actions'][ME],
    P = A extends (arg: EventData<infer Payload>) => void ? Payload : never
  >(
    moduleName: MN,
    moduleEvent: ME
  ) =>
  (...args: [P] extends [undefined] ? [] : [P]) => {
    const { sharedWorker, clientId } = store;
    assert(sharedWorker, 'Shared worker is undefined!');
    assert(clientId, 'Client id is undefined!');
    const [payload] = args as [P];
    sharedWorker.port.postMessage(
      JSON.parse(
        JSON.stringify({
          moduleName,
          moduleEvent,
          clientId,
          payload,
        })
      )
    );
  };
