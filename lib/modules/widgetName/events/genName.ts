import type { EventData, ModuleEventContext } from '../../../lib';
import type { GetNameChannel } from '../channels';
import { getCorrectNameExpr, getUniqKey } from '../utils';
import type { WidgetNameContext } from '../widgetName.types';

export interface GenNameData {
  widgetType: string;
  widgetId: string;
  widgetBaseName: string;
  widgetName: string;
}

export const genName =
  ({
    context,
    channels,
  }: ModuleEventContext<WidgetNameContext, [GetNameChannel]>) =>
  ({
    postMessage,
    clientId,
    payload: { widgetType, widgetId, widgetBaseName, widgetName },
  }: EventData<GenNameData>) => {
    const { widgets } = context;
    const uniqKey = getUniqKey(clientId, widgetId);

    if (widgets[widgetType]?.[uniqKey]) {
      channels.GetName({
        postMessage,
        data: {
          widgetType,
          widgetId,
          name: widgets[widgetType][uniqKey],
        },
      });
      return;
    }

    const hasCorrectNameExpr = getCorrectNameExpr(widgetName, widgetBaseName);
    const hasIndex = hasCorrectNameExpr?.groups?.index != null;

    if (!widgets[widgetType]) {
      widgets[widgetType] = {};
    }

    if (!hasCorrectNameExpr || hasIndex) {
      if (hasIndex) {
        widgets[widgetType][uniqKey] = widgetName;
      }

      channels.GetName({
        postMessage,
        data: {
          widgetType,
          widgetId,
          name: widgetName,
        },
      });
      return;
    }

    const widgetNames = Object.values(widgets[widgetType]);

    let newIndex = 1;
    while (widgetNames.some((name) => name.endsWith(String(newIndex)))) {
      newIndex++;
    }

    const newName = `${widgetBaseName} ${newIndex}`;
    widgets[widgetType][uniqKey] = newName;

    channels.GetName({
      postMessage,
      data: {
        widgetType,
        widgetId,
        name: newName,
      },
    });
  };
