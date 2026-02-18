import React, { useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { useColorScheme } from '@/hooks/use-color-scheme';
import dayjs from 'dayjs';

interface DateRangePickerProps {
    initialStartDate?: string | null;
    initialEndDate?: string | null;
    onRangeChange: (range: { startDate: string | null; endDate: string | null }) => void;
}

export const DateRangePicker = ({
    initialStartDate,
    initialEndDate,
    onRangeChange,
}: DateRangePickerProps) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [startDate, setStartDate] = useState<string | null>(initialStartDate || null);
    const [endDate, setEndDate] = useState<string | null>(initialEndDate || null);

    // Sync state with props when they change (e.g. clear all)
    React.useEffect(() => {
        setStartDate(initialStartDate || null);
        setEndDate(initialEndDate || null);
    }, [initialStartDate, initialEndDate]);

    const markedDates = useMemo(() => {
        const marks: any = {};

        if (startDate) {
            marks[startDate] = {
                startingDay: true,
                color: isDark ? '#ffffff' : '#000000',
                textColor: isDark ? '#000000' : '#ffffff',
            };
        }

        if (endDate) {
            marks[endDate] = {
                endingDay: true,
                color: isDark ? '#ffffff' : '#000000',
                textColor: isDark ? '#000000' : '#ffffff',
            };
        }

        if (startDate && endDate) {
            // If end date is before start date, swap them for calculation
            const start = dayjs(startDate).isAfter(dayjs(endDate)) ? endDate : startDate;
            const end = dayjs(startDate).isAfter(dayjs(endDate)) ? startDate : endDate;

            let curr = dayjs(start).add(1, 'day');
            const last = dayjs(end);

            while (curr.isBefore(last)) {
                const dateStr = curr.format('YYYY-MM-DD');
                marks[dateStr] = {
                    color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                    textColor: isDark ? '#ffffff' : '#000000',
                };
                curr = curr.add(1, 'day');
            }
        }

        return marks;
    }, [startDate, endDate, isDark]);

    const onDayPress = (day: DateData) => {
        const date = day.dateString;

        if (!startDate || (startDate && endDate)) {
            // Start a new range
            setStartDate(date);
            setEndDate(null);
            onRangeChange({ startDate: date, endDate: null });
        } else {
            // Complete the range
            // Ensure start is always before end
            let newStart = startDate;
            let newEnd = date;

            if (dayjs(date).isBefore(dayjs(startDate))) {
                newStart = date;
                newEnd = startDate;
            }

            setStartDate(newStart);
            setEndDate(newEnd);
            onRangeChange({ startDate: newStart, endDate: newEnd });
        }
    };

    return (
        <View style={styles.container}>
            <Calendar
                current={startDate || undefined}
                onDayPress={onDayPress}
                markingType={'period'}
                markedDates={markedDates}
                theme={{
                    calendarBackground: 'transparent',
                    textSectionTitleColor: isDark ? '#a1a1aa' : '#71717a',
                    selectedDayBackgroundColor: isDark ? '#ffffff' : '#000000',
                    selectedDayTextColor: isDark ? '#000000' : '#ffffff',
                    todayTextColor: isDark ? '#60a5fa' : '#3b82f6',
                    dayTextColor: isDark ? '#ffffff' : '#000000',
                    textDisabledColor: isDark ? '#3f3f46' : '#d4d4d8',
                    monthTextColor: isDark ? '#ffffff' : '#000000',
                    arrowColor: isDark ? '#ffffff' : '#000000',
                    textDayFontWeight: '400',
                    textMonthFontWeight: '600',
                    textDayHeaderFontWeight: '400',
                    textDayFontSize: 16,
                    textMonthFontSize: 16,
                    textDayHeaderFontSize: 13,
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 0,
    },
});
