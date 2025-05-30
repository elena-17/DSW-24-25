export const environment = {
  production: true,
  apiUrl: (window as any).__env?.API_URL,
  mercure: (window as any).__env?.MERCURE_URL,
  bankUrl: (window as any).__env?.BANK_URL,
  STRIPE_PUBLIC_KEY: (window as any).__env?.STRIPE_PUBLIC_KEY,
};
