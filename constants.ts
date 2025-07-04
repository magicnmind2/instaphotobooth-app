import { PurchaseOption } from './types';

export const MASTER_ADMIN_CODE = '0242';

export const PURCHASE_OPTIONS: PurchaseOption[] = [
  {
    id: 'starter_1hr',
    name: 'Starter',
    duration: 1 * 60 * 60,
    price: 19,
    emailLimit: 150,
    hasDesignStudio: false,
    features: ['1 Hour Session', 'Unlimited Photos', 'Standard Filters', '150 Email Sends'],
  },
  {
    id: 'pro_4hr',
    name: 'Pro',
    duration: 4 * 60 * 60,
    price: 49,
    emailLimit: 500,
    hasDesignStudio: true,
    features: ['4 Hour Session', 'All Starter Features', '500 Email Sends', 'Photo Design Studio'],
    isMostPopular: true,
  },
  {
    id: 'ultimate_day',
    name: 'Ultimate',
    duration: 24 * 60 * 60,
    price: 99,
    emailLimit: 1000,
    hasDesignStudio: true,
    features: ['All Day Session', 'All Pro Features', '1000 Email Sends', 'Edit Design Anytime'],
  },
];
