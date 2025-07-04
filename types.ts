export enum AppState {
  SALES_PAGE,
  LANDING,
  DESIGN_STUDIO, // New state for the photo editor
  CHECKOUT, // This is a virtual state, handled by redirecting to Stripe
  PURCHASE_SUCCESS,
  ACTIVATION,
  PREVIEW,
  PHOTO_DISPLAY,
  SESSION_EXPIRED,
}

export enum PhotoMode {
  SINGLE = 'Single Photo',
  GRID = 'Photo Grid',
}

export enum PhotoFilter {
  NORMAL = 'Normal',
  CLASSIC = 'Classic',
  VINTAGE = 'Vintage',
  GOLDEN = 'Golden',
}

export interface PurchaseOption {
  id: string;
  name: string;
  duration: number; // in seconds
  price: number;
  emailLimit: number;
  features: string[];
  hasDesignStudio: boolean;
  isMostPopular?: boolean;
}

// --- Design Studio Types ---
export interface TextElement {
  id: string;
  type: 'text';
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  fill: string;
  rotation: number;
  scaleX: number;
  scaleY: number;
}

export interface ImageElement {
  id: string;
  type: 'image';
  src: string; // data URL
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
}

export type DesignElement = TextElement | ImageElement;

export interface DesignLayout {
  elements: DesignElement[];
}
// --- End Design Studio Types ---

export interface ActiveSession {
  code: string;
  expiresAt: number; // timestamp
  emailLimit: number;
  emailsSent: number;
  hasDesignStudio: boolean;
  designLayout: DesignLayout | null;
}

// Backend code representation for clarity
export interface Code {
  code: string;
  expiresAt: number;
  durationSeconds: number;
  used: boolean;
  emailLimit: number;
  emailsSent: number;
  hasDesignStudio: boolean;
  designLayout: DesignLayout | null;
}
