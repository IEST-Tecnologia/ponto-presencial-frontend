"use client";
import { useState, useEffect } from "react";

interface DateRangePickerProps {
  onRangeChange?: (startDate: string, endDate: string) => void;
}

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

/**
 * Calculate default start date based on rules:
 * - If current day <= 20: start from day 20 of previous month
 * - If current day > 20: start from day 20 of current month
 */
function getDefaultStartDate(): Date {
  const today = new Date();
  const currentDay = today.getDate();

  if (currentDay <= 21) {
    // Day 20 of previous month
    const prevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 21);
    return prevMonth;
  } else {
    // Day 20 of current month
    const currentMonth = new Date(today.getFullYear(), today.getMonth(), 21);
    return currentMonth;
  }
}

function formatDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatDateToISO(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
}

export default function DateRangePicker({
  onRangeChange,
}: DateRangePickerProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [startDate, setStartDate] = useState<Date | null>(
    getDefaultStartDate()
  );
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [isSelectingStart, setIsSelectingStart] = useState(true);

  useEffect(() => {
    if (onRangeChange) {
      const startDateStr = startDate ? formatDateToISO(startDate) : "";
      const endDateStr = endDate ? formatDateToISO(endDate) : "";
      onRangeChange(startDateStr, endDateStr);
    }
  }, [startDate, endDate, onRangeChange]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startingDay = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();
  const prevMonthLastDay = new Date(year, month, 0).getDate();

  const prevMonthFn = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonthFn = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  type DayInfo = {
    day: number;
    month: number;
    year: number;
    isCurrentMonth: boolean;
  };
  const days: DayInfo[] = [];

  // Previous month days
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  for (let i = startingDay - 1; i >= 0; i--) {
    days.push({
      day: prevMonthLastDay - i,
      month: prevMonth,
      year: prevYear,
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ day: i, month, year, isCurrentMonth: true });
  }

  // Next month days to fill 6 rows (42 cells)
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push({
      day: i,
      month: nextMonth,
      year: nextYear,
      isCurrentMonth: false,
    });
  }

  const today = new Date();
  const isToday = (day: number, m: number, y: number) =>
    day === today.getDate() &&
    m === today.getMonth() &&
    y === today.getFullYear();

  const handleDayClick = (day: number, m: number, y: number) => {
    const selectedDate = new Date(y, m, day);

    if (isSelectingStart) {
      setStartDate(selectedDate);
      setEndDate(null);
      setIsSelectingStart(false);
    } else {
      if (startDate && selectedDate < startDate) {
        // If selected date is before start date, swap them
        setEndDate(startDate);
        setStartDate(selectedDate);
      } else {
        setEndDate(selectedDate);
      }
      setIsSelectingStart(true);
    }
  };

  const isInRange = (day: number, m: number, y: number): boolean => {
    if (!startDate || !endDate) return false;
    const date = new Date(y, m, day);
    return date >= startDate && date <= endDate;
  };

  const isStartDate = (day: number, m: number, y: number): boolean => {
    if (!startDate) return false;
    return formatDateKey(new Date(y, m, day)) === formatDateKey(startDate);
  };

  const isEndDate = (day: number, m: number, y: number): boolean => {
    if (!endDate) return false;
    return formatDateKey(new Date(y, m, day)) === formatDateKey(endDate);
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return "Selecione";
    return `${String(date.getDate()).padStart(2, "0")}/${String(
      date.getMonth() + 1
    ).padStart(2, "0")}/${date.getFullYear()}`;
  };

  const resetSelection = () => {
    setStartDate(getDefaultStartDate());
    setEndDate(new Date());
    setIsSelectingStart(true);
  };

  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow p-4">
      {/* Date Range Display */}
      <div className="mb-4 space-y-2 flex flex-col items-center">
        <div className="flex items-center gap-2 w-full">
          <div className="flex-1">
            <label className="text-xs text-gray-500 block mb-1">
              Data Inicial
            </label>
            <div
              className={`px-3 py-2 border rounded-lg text-sm text-gray-500 ${
                isSelectingStart
                  ? "border-primary bg-primary/5"
                  : "border-gray-300"
              }`}
            >
              {formatDate(startDate)}
            </div>
          </div>
          <span className="text-gray-400 mt-5">→</span>
          <div className="flex-1">
            <label className="text-xs text-gray-500 block mb-1">
              Data Final
            </label>
            <div
              className={`px-3 py-2 border rounded-lg text-sm text-gray-500 ${
                !isSelectingStart
                  ? "border-primary bg-primary/5"
                  : "border-gray-300"
              }`}
            >
              {formatDate(endDate)}
            </div>
          </div>
        </div>
        <button
          onClick={resetSelection}
          className="py-1 px-5 text-xs text-gray-600 hover:text-primary  hover:bg-gray-200 mx-auto rounded-md cursor:pointer"
        >
          Redefinir período padrão
        </button>
      </div>

      {/* Calendar Navigation */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={prevMonthFn}
          className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
        >
          ←
        </button>
        <h2 className="text-lg font-semibold text-gray-800">
          {MONTHS[month]} {year}
        </h2>
        <button
          onClick={nextMonthFn}
          className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
        >
          →
        </button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-gray-500 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-1">
        {days.map(({ day, month: m, year: y, isCurrentMonth }, index) => {
          const isTodayDay = isToday(day, m, y);
          const inRange = isInRange(day, m, y);
          const isStart = isStartDate(day, m, y);
          const isEnd = isEndDate(day, m, y);

          if (!isCurrentMonth) {
            return (
              <div
                key={`other-${index}`}
                className="aspect-square flex items-center justify-center rounded-lg text-sm text-gray-300 cursor-not-allowed"
              >
                {day}
              </div>
            );
          }

          return (
            <button
              key={`current-${day}`}
              onClick={() => handleDayClick(day, m, y)}
              className={`aspect-square flex items-center justify-center rounded-lg text-sm relative transition-colors ${
                isStart || isEnd
                  ? "bg-primary text-white font-bold"
                  : inRange
                  ? "bg-primary/20 text-primary"
                  : isTodayDay
                  ? "bg-gray-200 text-gray-900 font-bold"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {day}
              {(isStart || isEnd) && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Helper Text */}
      <div className="mt-3 text-xs text-gray-500 text-center">
        {isSelectingStart
          ? "Selecione a data inicial"
          : "Selecione a data final"}
      </div>
    </div>
  );
}
