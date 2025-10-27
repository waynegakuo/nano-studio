export type AppErrorLevel = 'info' | 'warning' | 'error';

export interface AppErrorMessage {
  id: string;
  text: string;
  level: AppErrorLevel;
  timeoutMs?: number; // auto-dismiss time; undefined = persistent
}
