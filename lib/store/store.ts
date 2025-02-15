export interface Store {
  clientId: string | null;
  sharedWorker: SharedWorker | null;
}

export const store: Store = {
  clientId: null,
  sharedWorker: null,
};
