// @ts-check
import { useParams } from 'react-router-dom';
import { useResolveHandleOrDid } from '../api';

export function useAccountResolver() {
  let { handle } = useParams();
  return useResolveHandleOrDid(handle);
}
