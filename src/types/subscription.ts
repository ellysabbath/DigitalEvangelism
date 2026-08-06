// src/types/subscription.ts
export interface Subscription {
  id: number;
  email: string;
  name: string;
  subscription_type: 'newsletter' | 'weekly_digest' | 'prayer_updates' | 'event_notifications' | 'sermon_updates' | 'all';
  subscription_type_display: string;
  status: 'active' | 'inactive' | 'unsubscribed';
  status_display: string;
  is_confirmed: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  confirmed_at: string | null;
}

export interface SubscriptionLog {
  id: number;
  subscription: number;
  action: 'subscribed' | 'confirmed' | 'unsubscribed' | 'resubscribed' | 'updated' | 'email_sent' | 'email_opened' | 'email_clicked';
  details: Record<string, any>;
  ip_address: string | null;
  user_agent: string;
  created_at: string;
}

export interface SubscriptionStats {
  total: number;
  active: number;
  inactive: number;
  unsubscribed: number;
  confirmed: number;
  unconfirmed: number;
  by_type: Record<string, number>;
  recent: Subscription[];
}

export interface SubscriptionFormData {
  email: string;
  name: string;
  subscription_type: string;
}

export interface SubscriptionCreateData {
  email: string;
  name?: string;
  subscription_type?: string;
}