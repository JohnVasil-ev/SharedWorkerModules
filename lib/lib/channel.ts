export interface Channel<
  N extends string,
  A extends (...args: Array<any>) => void
> {
  name: N;
  action: A;
}

export interface ChannelCreator {
  <N extends string, A extends (...args: Array<any>) => void>(
    name: N,
    action: A
  ): Channel<N, A>;
}

/**
 * *channel* - это функция, которая возвращает *action*.
 *
 * Он необходим для наполнения Модуля методами для
 * отправки данных на клиент.
 *
 * @example
 * ```typescript
 * interface ModuleContext {
 *   moduleField: string;
 * }
 *
 * const moduleContext: ModuleContext = {
 *   moduleField: 'test';
 * }
 *
 * const moduleChannelFunc =
 *   ({ context }: ModuleChannelContext<ModuleContext>) =>
 *   ({ postMessage payload }: ChannelData<string, number>) => {
 *     postMessage(String(payload));
 *   }
 *
 * const moduleEventFunc =
 *   ({ context, channels, plugins }: ModuleEventContext<ModuleContext, [typeof pluginName]>) =>
 *   ({ port, payload }: EventData<{ name: string }>) => {
 *     if (payload.name !== 'test') return;
 *
 *     channels.ChannelName(123);
 *   }
 *
 * const moduleName = module('ModuleName', moduleContext, {
 *   events: [
 *     event('EventName', moduleEventFunc),
 *   ],
 *   channels: [
 *     channel('ChannelName', moduleChannelFunc),
 *   ],
 * });
 * ```
 */
export const channel: ChannelCreator = (name, action) => ({ name, action });
