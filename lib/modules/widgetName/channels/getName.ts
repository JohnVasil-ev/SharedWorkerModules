import { channel, type ChannelData } from '../../../lib';

export interface GetNameReturn {
  widgetType: string;
  widgetId: string;
  name: string;
}

export const getNameChannel = channel(
  'GetName',
  () =>
    ({ postMessage, data }: ChannelData<GetNameReturn>) =>
      postMessage(data)
);

export type GetNameChannel = typeof getNameChannel;
