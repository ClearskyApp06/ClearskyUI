import { localise } from '../../localisation';

export function HistoryLoading() {
  return <div>{localise('Loading', { uk: 'Зачекайте' })}...</div>;
}
