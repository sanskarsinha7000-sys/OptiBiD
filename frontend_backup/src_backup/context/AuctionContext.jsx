import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { api, isMockMode } from "../services/api";

const AuctionContext = createContext(null);

export const AuctionProvider = ({ children }) => {
  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [priceResult, setPriceResult] = useState(null);
  const [utilityResult, setUtilityResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mockMode, setMockMode] = useState(isMockMode);

  const loadAuction = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getAuction();
      if (res.success) {
        setAuction(res.data);
      } else {
        setError(res.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadBids = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getBids();
      if (res.success) {
        setBids(res.data);
      } else {
        setError(res.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadResults = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getResults();
      if (res.success) {
        const { auction: a, priceResult, utilityResult, bids } = res.data;
        setAuction(a);
        setPriceResult(priceResult);
        setUtilityResult(utilityResult);
        setBids(bids || []);
      } else {
        setError(res.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createAuction = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.createAuction(data);
      if (res.success) {
        setAuction(res.data);
        setBids([]);
        setPriceResult(null);
        setUtilityResult(null);
        return { success: true };
      }
      return { success: false, error: res.error };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const placeBid = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.placeBid(data);
      if (res.success) {
        setBids((prev) => [...prev, res.data]);
        return { success: true };
      }
      return { success: false, error: res.error };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const closeAuction = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.closeAuction();
      if (res.success) {
        setAuction((prev) => (prev ? { ...prev, active: false } : null));
        return { success: true };
      }
      return { success: false, error: res.error };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const runPriceStrategy = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.runPriceStrategy();
      if (res.success) {
        setPriceResult(res.data);
        return { success: true };
      }
      return { success: false, error: res.error };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const runUtilityStrategy = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.runUtilityStrategy();
      if (res.success) {
        setUtilityResult(res.data);
        return { success: true };
      }
      return { success: false, error: res.error };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const compareStrategies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.compareStrategies();
      if (res.success) {
        setPriceResult(res.data.priceWinner);
        setUtilityResult(res.data.utilityWinner);
        setBids(res.data.bids);
        return { success: true, explanation: res.data.explanation };
      }
      return { success: false, error: res.error };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAuction();
    loadBids();
  }, [loadAuction, loadBids]);

  const value = {
    auction,
    bids,
    priceResult,
    utilityResult,
    loading,
    error,
    mockMode,
    createAuction,
    placeBid,
    closeAuction,
    runPriceStrategy,
    runUtilityStrategy,
    compareStrategies,
    loadAuction,
    loadBids,
    loadResults,
  };

  return (
    <AuctionContext.Provider value={value}>
      {children}
    </AuctionContext.Provider>
  );
};

export const useAuction = () => {
  const context = useContext(AuctionContext);
  if (!context) {
    throw new Error("useAuction must be used within an AuctionProvider");
  }
  return context;
};