import React, { createContext, useCallback, useContext, useEffect, useRef } from 'react';
import { View, ViewStyle } from 'react-native';

type MeasureResult = { x: number; y: number; width: number; height: number };

interface TourContextValue {
  registerTarget: (id: string, measure: () => Promise<MeasureResult>) => void;
  measureTarget: (id: string) => Promise<MeasureResult | null>;
}

const TourContext = createContext<TourContextValue | null>(null);

export function TourProvider({ children }: { children: React.ReactNode }) {
  const registry = useRef<Map<string, () => Promise<MeasureResult>>>(new Map());

  const registerTarget = useCallback((id: string, measure: () => Promise<MeasureResult>) => {
    registry.current.set(id, measure);
  }, []);

  const measureTarget = useCallback(async (id: string): Promise<MeasureResult | null> => {
    const fn = registry.current.get(id);
    if (!fn) return null;
    try { return await fn(); } catch { return null; }
  }, []);

  return (
    <TourContext.Provider value={{ registerTarget, measureTarget }}>
      {children}
    </TourContext.Provider>
  );
}

export function useTourContext() {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error('useTourContext must be used within TourProvider');
  return ctx;
}

// ── TourTarget ────────────────────────────────────────────────────────────────
// Wrap any element you want the tour to spotlight. The id must match a step's
// targetId in ProductTour.

interface TourTargetProps {
  id: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

export function TourTarget({ id, children, style }: TourTargetProps) {
  const ref = useRef<View>(null);
  const { registerTarget } = useTourContext();

  useEffect(() => {
    registerTarget(id, () =>
      new Promise((resolve, reject) => {
        if (!ref.current) { reject(new Error('ref not ready')); return; }
        ref.current.measure((_x, _y, width, height, pageX, pageY) => {
          resolve({ x: pageX, y: pageY, width, height });
        });
      })
    );
  }, [id, registerTarget]);

  return (
    <View ref={ref} collapsable={false} style={style}>
      {children}
    </View>
  );
}
