import { createContext, useContext, useState, useMemo } from 'react';

const EXCHANGE_RATES = {
  USD: 1,
  PKR: 278,
  INR: 83,
  EUR: 0.92,
  GBP: 0.79,
};

const CURRENCY_SYMBOLS = {
  USD: '$',
  PKR: 'PKR ',
  INR: '₹',
  EUR: '€',
  GBP: '£',
};

export const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => localStorage.getItem('currency') || 'USD');

  const updateCurrency = (c) => {
    setCurrency(c);
    localStorage.setItem('currency', c);
  };

  const convertPrice = (usdPrice) => {
    const rate = EXCHANGE_RATES[currency] || 1;
    return Math.round(usdPrice * rate);
  };

  const formatPrice = (usdPrice) => {
    const converted = convertPrice(usdPrice);
    const symbol = CURRENCY_SYMBOLS[currency] || '$';
    if (currency === 'PKR') return `${symbol}${converted.toLocaleString()}`;
    return `${symbol}${converted.toLocaleString()}`;
  };

  const value = useMemo(() => ({ currency, setCurrency: updateCurrency, convertPrice, formatPrice, rates: EXCHANGE_RATES, symbols: CURRENCY_SYMBOLS }), [currency]);

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
};
