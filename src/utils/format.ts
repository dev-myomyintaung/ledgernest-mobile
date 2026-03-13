
export const getAmountNumber = (value: string | number) =>
    typeof value === "number" ? value : Number.parseFloat(value);

export const formatAmount = (value: string | number, symbol = '$') => {
    const parsed = getAmountNumber(value);
    if (Number.isNaN(parsed)) return `${symbol}0.00`;
    return `${symbol}${Math.abs(parsed).toFixed(2)}`;
};

export const hexToRgba = (hex: string, alpha: number) => {
    const clean = hex.replace("#", "");
    if (clean.length !== 6) return `rgba(113, 113, 122, ${alpha})`;
    const parsed = Number.parseInt(clean, 16);
    const r = (parsed >> 16) & 255;
    const g = (parsed >> 8) & 255;
    const b = parsed & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const formatDateLabel = (isoDate: string) => {
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) return "Unknown date";

    const now = new Date();
    const today = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
    ).getTime();
    const target = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
    ).getTime();
    const dayDiff = Math.round((today - target) / 86_400_000);
    const time = date.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
    });

    if (dayDiff === 0) return `Today, ${time}`;
    if (dayDiff === 1) return "Yesterday";
    return date.toLocaleDateString();
};

export const formatReceiptGroupDate = (isoDate?: string | null) => {
    if (!isoDate) return "Unknown date";
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) return "Unknown date";
    return date.toLocaleDateString([], {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
};

export const toTimestamp = (isoDate?: string | null) => {
    if (!isoDate) return 0;
    const date = new Date(isoDate);
    return Number.isNaN(date.getTime()) ? 0 : date.getTime();
};
