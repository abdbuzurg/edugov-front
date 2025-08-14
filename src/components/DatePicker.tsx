"use client"

import React, { useState, useEffect, Dispatch, SetStateAction } from 'react';

const isLeapYear = (year: number): boolean => {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
};

const getDaysInMonth = (year: number, month: number): number => {
  if (month === 2) {
    return isLeapYear(year) ? 29 : 28;
  }
  const thirtyDayMonths = [4, 6, 9, 11];
  if (thirtyDayMonths.includes(month)) {
    return 30;
  }
  return 31;
};

export interface SelectedDate {
  day: number;
  month: number;
  year: number;
}

interface DatePickerSelectProps {
  date: SelectedDate
  onDateChange: Dispatch<SetStateAction<SelectedDate>>
  isDisabled?: boolean
}

export default function DatePickerSelect({
  date,
  onDateChange,
  isDisabled = false 
}: DatePickerSelectProps) {
  const currentYear = new Date().getFullYear();
  // State for the selected date parts
  const [selectedYear, setSelectedYear] = useState<number>(date.year);
  const [selectedMonth, setSelectedMonth] = useState<number>(date.month);
  const [selectedDay, setSelectedDay] = useState<number>(date.day);

  // State to hold the dynamic number of days for the selected month/year
  const [daysInMonth, setDaysInMonth] = useState<number>(() => getDaysInMonth(currentYear, 1));

  // Generate lists for the dropdowns
  // Years: from the current year down by 100 years
  const years = Array.from({ length: 101 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  // Effect to update the number of days when month or year changes
  useEffect(() => {
    const days = getDaysInMonth(selectedYear, selectedMonth);
    setDaysInMonth(days);

    // CRITICAL: If the currently selected day is greater than the new number of days
    // in the month, reset the day to the last valid day.
    // e.g., switching from March 31 to February.
    if (selectedDay > days) {
      setSelectedDay(days);
    }
  }, [selectedMonth, selectedYear, selectedDay]);

  // Effect to notify the parent component of any date changes
  useEffect(() => {
    onDateChange({
      day: selectedDay,
      month: selectedMonth,
      year: selectedYear,
    });
  }, [selectedDay, selectedMonth, selectedYear, onDateChange]);

  // --- Event Handlers ---
  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(parseInt(e.target.value, 10));
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(parseInt(e.target.value, 10));
  };

  const handleDayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDay(parseInt(e.target.value, 10));
  };

  return (
    <div className="flex gap-x-2">
      <select
        value={selectedDay}
        onChange={handleDayChange}
        aria-label="Day"
        className={`flex-1 border rounded-sm px-2 py-2 ${isDisabled && "bg-gray-300"}`}
        disabled={isDisabled}
      >
        <option disabled value={0}>День</option>
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
          <option key={day} value={day}>
            {day}
          </option>
        ))}
      </select>
      <select
        value={selectedMonth}
        onChange={handleMonthChange}
        aria-label="Month"
        className={`flex-1 border rounded-sm px-2 py-2 ${isDisabled && "bg-gray-300"}`}
        disabled={isDisabled}
      >
        <option disabled value={0}>Месяц</option>
        {months.map((month) => (
          <option key={month} value={month}>
            {month}
          </option>
        ))}
      </select>
      <select
        value={selectedYear}
        onChange={handleYearChange}
        aria-label="Year"
        className={`flex-1 border rounded-sm px-2 py-2 ${isDisabled && "bg-gray-300"}`}
        disabled={isDisabled}
      >
        <option disabled value={0}>Год</option>
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>
  );
};