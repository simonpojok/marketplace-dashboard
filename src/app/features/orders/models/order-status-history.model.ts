import {OrderStatus} from './order.model';

export interface OrderStatusHistory {
  id: string;
  status: OrderStatus;
  status_display?: string;
  notes?: string;
  created_at: string;
}
