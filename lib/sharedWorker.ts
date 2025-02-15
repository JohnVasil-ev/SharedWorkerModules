import { onMessage } from './modules';

export declare const self: SharedWorkerGlobalScope;

interface MessageData {
  clientId: string;
  moduleName: any;
  moduleEvent: any;
  payload: any;
}

self.onconnect = ({ ports }: MessageEvent) => {
  const [port] = ports;
  if (!port) return;
  port.onmessage = ({ data }: MessageEvent<MessageData>) =>
    onMessage(
      port,
      data.clientId,
      data.moduleName,
      data.moduleEvent,
      data.payload
    );
};
