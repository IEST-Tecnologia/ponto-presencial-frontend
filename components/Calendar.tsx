"use client";
import { useState } from "react";
import { TimeRecord } from "@/models/timeRecord";
import { formatTime } from "@/utils/date";

interface CalendarProps {
  records: TimeRecord[];
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

export default function Calendar({ records }: CalendarProps) {
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
    const localDate = new Date(record.date);
    const dateKey = `${localDate.getFullYear()}-${String(localDate.getMonth() + 1).padStart(2, "0")}-${String(localDate.getDate()).padStart(2, "0")}`;
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

  type DayInfo = { day: number; month: number; year: number; isCurrentMonth: boolean };
  const days: DayInfo[] = [];

  // Previous month days
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  for (let i = startingDay - 1; i >= 0; i--) {
    days.push({ day: prevMonthLastDay - i, month: prevMonth, year: prevYear, isCurrentMonth: false });
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
    days.push({ day: i, month: nextMonth, year: nextYear, isCurrentMonth: false });
  }

  const today = new Date();
  const isToday = (day: number) =>
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();

  const getRecordsForDay = (day: number, m: number, y: number): TimeRecord[] => {
    const dateKey = `${y}-${String(m + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
    return recordsByDate.get(dateKey) || [];
  };

  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow p-4">
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

          if (!isCurrentMonth) {
            return (
              <div
                key={`other-${index}`}
                className={`aspect-square flex items-center justify-center rounded-lg text-sm relative ${
                  hasRecords ? "text-gray-400 bg-primary/10" : "text-gray-300"
                }`}
                title={hasRecords ? dayRecords.map((r) => formatTime(r.date)).join(", ") : undefined}
              >
                {day}
                {hasRecords && (
                  <span className="absolute bottom-0.5 text-[10px] text-primary/50">✓</span>
                )}
              </div>
            );
          }

          const isTodayDay = isToday(day);
          const todayWithRecords = isTodayDay && hasRecords;
          const todayWithoutRecords = isTodayDay && !hasRecords;

          return (
            <div
              key={`current-${day}`}
              className={`aspect-square flex flex-col items-center justify-center rounded-lg text-sm relative ${
                todayWithRecords
                  ? "bg-primary text-white font-bold"
                  : todayWithoutRecords
                  ? "bg-primary/10 text-gray-600 font-bold ring-2 ring-primary ring-inset"
                  : hasRecords
                  ? "bg-primary/20 text-primary"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              title={
                hasRecords
                  ? dayRecords.map((r) => formatTime(r.date)).join(", ")
                  : undefined
              }
            >
              {day}
              {hasRecords && (
                <span
                  className={`absolute bottom-0.5 text-[10px] ${
                    isTodayDay ? "text-white" : "text-primary"
                  }`}
                >
                  ✓
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
