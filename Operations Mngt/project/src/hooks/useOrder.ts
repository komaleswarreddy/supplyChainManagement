import { useEffect } from 'react';
import { useOrders } from './useOrders';

export function useOrder(id: string) {
  const { order, loadingOrder, getOrder, error } = useOrders();
  
  useEffect(() => {
    if (id) {
      getOrder(id);
    }
  }, [id, getOrder]);
  
  return { order, loadingOrder, error };
} 