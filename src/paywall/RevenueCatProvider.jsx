import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Purchases } from '@revenuecat/purchases-js';
import { RC_API_KEY, OFFERING_ID } from './config';

const SubscriptionContext = createContext(null);

export function useSubscription() {
  return useContext(SubscriptionContext);
}

export function SubscriptionProvider({ children }) {
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);
  const [customerInfo, setCustomerInfo] = useState(null);
  const [offering, setOffering] = useState(null);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        await Purchases.configure({ apiKey: RC_API_KEY });

        const info = await Purchases.getCustomerInfo();
        if (!mounted) return;

        setCustomerInfo(info);
        setIsPro(info.entitlements?.active?.hasOwnProperty('pro') || false);

        try {
          const offerings = await Purchases.getOfferings();
          if (!mounted) return;
          setOffering(offerings.current || offerings.all?.[OFFERING_ID] || null);
        } catch (e) {
          console.warn('RevenueCat offerings error:', e);
        }
      } catch (e) {
        console.warn('RevenueCat init error:', e);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    init();
    return () => { mounted = false; };
  }, []);

  const purchasePackage = useCallback(async (pkg) => {
    if (purchasing) return false;
    setPurchasing(true);
    try {
      const { customerInfo: newInfo } = await Purchases.purchasePackage(pkg);
      setCustomerInfo(newInfo);
      setIsPro(newInfo.entitlements?.active?.hasOwnProperty('pro') || false);
      return true;
    } catch (e) {
      if (e?.userCancelled) return false;
      console.error('Purchase error:', e);
      return false;
    } finally {
      setPurchasing(false);
    }
  }, [purchasing]);

  const restorePurchases = useCallback(async () => {
    try {
      const info = await Purchases.restorePurchases();
      setCustomerInfo(info);
      setIsPro(info.entitlements?.active?.hasOwnProperty('pro') || false);
      return true;
    } catch (e) {
      console.error('Restore error:', e);
      return false;
    }
  }, []);

  const value = {
    isPro,
    loading,
    customerInfo,
    offering,
    purchasing,
    purchasePackage,
    restorePurchases,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}
