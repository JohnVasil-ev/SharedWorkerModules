export interface Event<
  N extends string,
  A extends (...args: Array<any>) => any
> {
  name: N;
  action: A;
}

export interface EventCreator {
  <N extends string, A extends (...args: Array<any>) => any>(
    name: N,
    action: A
  ): Event<N, A>;
}

/**
 * *event* - это функция, которая возвращает *action*.
 *
 * Он необходим для наполнения Модуля и Плагина методами
 * работы над собственным контекстом в обоих случаях, а
 * также для общения между клиентом и воркеров в случае
 * Модуля с помощью *channels*.
 *
 * В случае Модуля в ивенте также доступны *plugins*
 * и *channels*, которые были объявлены при инициализации
 * Модуля, однако тип плагинов нужно отдельно декларировать
 * внутри ивента.
 *
 * @example
 * ```typescript
 * // Plugin
 * interface PluginContext {
 *   pluginField: string;
 * }
 *
 * const pluginContext: PluginContext = {
 *   pluginField: 'test',
 * };
 *
 * const pluginEventFunc = (context: PluginContext) => (name: string) => {
 *   if (name !== 'test') return;
 *   return context.pluginField;
 * }
 *
 * const pluginName = plugin('PluginName', pluginContext, [
 *   event('EventName', pluginEventFunc),
 * ]);
 *
 * // Module
 * interface ModuleContext {
 *   moduleField: string;
 * }
 *
 * const moduleContext: ModuleContext = {
 *   moduleField: 'test';
 * }
 *
 * const moduleEventFunc =
 *   ({ context, plugins }: ModuleEventContext<ModuleContext, [typeof pluginName]>) =>
 *   ({ port, payload }: EventData<{ name: string }>) => {
 *     if (payload.name !== 'test') return;
 *     channels.ChannelName(123);
 *   }
 *
 * const moduleName = module('ModuleName', moduleContext, {
 *   events: [
 *     event('EventName', moduleEventFunc),
 *   ],
 *   plugins: [
 *     pluginName,
 *   ]
 * });
 * ```
 */
export const event: EventCreator = (name, action) => ({ name, action });
