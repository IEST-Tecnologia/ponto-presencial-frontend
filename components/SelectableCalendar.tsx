"use client";

import { TimeRecord } from "@/models/timeRecord";
import { useState } from "react";
import { extractDateFromUTC } from "@/utils/date";

interface CalendarProps {
  records: TimeRecord[];
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
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

export default function SelectableCalendar({
  records,
  selectedDate,
  onDateSelect,
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startingDay = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();
  const prevMonthLastDay = new Date(year, month, 0).getDate();

  const recordsByDate = new Map<string, TimeRecord[]>();
  records.forEach((record) => {
    // Extrai a data sem problemas de timezone
    const dateKey = extractDateFromUTC(record.date);
    if (!recordsByDate.has(dateKey)) {
      recordsByDate.set(dateKey, []);
    }
    recordsByDate.get(dateKey)!.push(record);
  });

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

  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ day: i, month, year, isCurrentMonth: true });
  }

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

  const getRecordsForDay = (
    day: number,
    m: number,
    y: number
  ): TimeRecord[] => {
    const dateKey = `${y}-${String(m + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
    return recordsByDate.get(dateKey) || [];
  };

  const isSelected = (day: number, m: number, y: number) => {
    if (!selectedDate) return false;
    return (
      day === selectedDate.getDate() &&
      m === selectedDate.getMonth() &&
      y === selectedDate.getFullYear()
    );
  };

  const handleDateClick = (
    day: number,
    m: number,
    y: number,
    hasRecords: boolean
  ) => {
    if (hasRecords) return;
    // Cria a data com horário do meio-dia para evitar problemas de timezone
    const date = new Date(y, m, day, 12, 0, 0, 0);
    onDateSelect(date);
  };

  return (
    <div className="w-full mx-auto max-w-md bg-white rounded-lg shadow border border-gray-200 p-4">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={prevMonthFn}
          className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
          type="button"
        >
          ←
        </button>
        <h2 className="text-lg font-semibold text-gray-800">
          {MONTHS[month]} {year}
        </h2>
        <button
          onClick={nextMonthFn}
          className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
          type="button"
        >
          →
        </button>
      </div>

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

      <div className="grid grid-cols-7 gap-1">
        {days.map(({ day, month: m, year: y, isCurrentMonth }, index) => {
          const dayRecords = getRecordsForDay(day, m, y);
          const hasRecords = dayRecords.length > 0;
          const isTodayDay = isToday(day, m, y);
          const isSelectedDay = isSelected(day, m, y);

          if (!isCurrentMonth) {
            return (
              <div
                key={`other-${index}`}
                className={`aspect-square flex items-center justify-center rounded-lg text-sm relative ${
                  hasRecords ? "text-gray-400 bg-primary/10" : "text-gray-300"
                }`}
              >
                {day}
                {hasRecords && (
                  <span className="absolute bottom-0.5 text-[10px] text-primary/50">
                    ✓
                  </span>
                )}
              </div>
            );
          }

          return (
            <button
              key={`current-${day}`}
              type="button"
              onClick={() => handleDateClick(day, m, y, hasRecords)}
              disabled={hasRecords}
              className={`aspect-square flex flex-col items-center justify-center rounded-lg text-sm relative transition-colors ${
                isSelectedDay
                  ? "bg-primary text-white font-bold ring-2 ring-primary ring-offset-2"
                  : hasRecords
                  ? "bg-primary/20 text-primary cursor-not-allowed"
                  : isTodayDay
                  ? "bg-primary/10 text-gray-600 font-bold ring-2 ring-primary ring-inset hover:bg-primary/20"
                  : "text-gray-700 hover:bg-gray-100 cursor-pointer"
              }`}
            >
              {day}
              {hasRecords && (
                <span className="absolute bottom-0.5 text-[10px] text-primary">
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>

      {selectedDate && (
        <div className="mt-4 p-3 bg-primary/10 rounded-md text-sm text-gray-700">
          <strong>Data selecionada:</strong>{" "}
          {selectedDate.toLocaleDateString("pt-BR")}
        </div>
      )}
    </div>
  );
}
