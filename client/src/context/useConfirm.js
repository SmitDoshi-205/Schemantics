import { useContext } from 'react';
import { ConfirmContext } from './context';

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used inside a ConfirmProvider');
  return ctx;
}