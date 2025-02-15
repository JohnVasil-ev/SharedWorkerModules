import type { EventData, ModuleEventContext } from '../../../lib';
import type { WidgetNameContext } from '../widgetName.types';

export const releaseClient =
  ({ context }: ModuleEventContext<WidgetNameContext>) =>
  ({ clientId }: EventData) => {
    const { widgets } = context;

    for (const widgetType in widgets) {
      for (const uniqKey in widgets[widgetType]) {
        if (uniqKey.startsWith(clientId)) {
          delete widgets[widgetType][uniqKey];
        }
      }
      if (!Object.keys(widgets[widgetType]).length) {
        delete widgets[widgetType];
      }
    }
  };
