import { useSettingsStore } from '../store/settingsStore';
import { formatAmount } from '../utils/format';

export const useAppCurrency = () => {
    const currency = useSettingsStore((s) => s.currency);

    return {
        symbol: currency.symbol,
        code: currency.code,
        format: (value: string | number) => formatAmount(value, currency.symbol),
    };
};
