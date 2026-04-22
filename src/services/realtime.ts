import { supabase } from '../lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

type OrderStatus = 'Pending' | 'In Progress' | 'Done';

interface KitchenOrderUpdate {
  type: 'new_order' | 'status_update';
  orderId: string;
  status?: OrderStatus;
}

let kitchenChannel: RealtimeChannel | null = null;

/**
 * Subscribe to kitchen order updates via Supabase Realtime.
 * Replaces the old SSE connection to /api/kitchen/subscribe.
 *
 * @param onNewOrder  - called when a new order row is inserted
 * @param onStatusUpdate - called when an order's metadata (kitchen_status) changes
 */
export function subscribeToKitchenUpdates(
  onNewOrder: (update: KitchenOrderUpdate) => void,
  onStatusUpdate: (update: KitchenOrderUpdate) => void
): () => void {
  // Clean up any existing channel
  if (kitchenChannel) {
    supabase.removeChannel(kitchenChannel);
  }

  kitchenChannel = supabase
    .channel('kitchen-orders')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'orders' },
      (payload) => {
        onNewOrder({
          type: 'new_order',
          orderId: payload.new.id,
        });
      }
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'orders' },
      (payload) => {
        const newMeta = payload.new.metadata as any;
        if (newMeta?.kitchen_status) {
          onStatusUpdate({
            type: 'status_update',
            orderId: payload.new.id,
            status: newMeta.kitchen_status as OrderStatus,
          });
        }
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('✅ Kitchen realtime connected');
      } else if (status === 'CHANNEL_ERROR') {
        console.error('❌ Kitchen realtime error');
      }
    });

  // Return unsubscribe function
  return () => {
    if (kitchenChannel) {
      supabase.removeChannel(kitchenChannel);
      kitchenChannel = null;
    }
  };
}

/**
 * Subscribe to any table for real-time updates.
 */
export function subscribeToTable(
  table: string,
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*',
  callback: (payload: any) => void
): () => void {
  const channel = supabase
    .channel(`${table}-${event}-${Date.now()}`)
    .on('postgres_changes', { event, schema: 'public', table }, callback)
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
