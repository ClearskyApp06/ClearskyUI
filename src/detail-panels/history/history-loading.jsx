import React from 'react';
import { localise } from '../../localisation';

export function HistoryLoading({ account }) {
  return (<div>{localise('Loading', {uk: 'Зачекайте'})}...</div>);
}