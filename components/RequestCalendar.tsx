"use client";

import { useState } from "react";
import { convertUTCToBrasiliaDate } from "@/utils/date";

interface RequestCalendarProps {
  requestDate: string;
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

export default function RequestCalendar({ requestDate }: RequestCalendarProps) {
  const requestedDate = convertUTCToBrasiliaDate(requestDate);

  const year = requestedDate.getFullYear();
  const month = requestedDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startingDay = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();
  const prevMonthLastDay = new Date(year, month, 0).getDate();

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

  const isRequestedDate = (day: number, m: number, y: number) => {
    return (
      day === requestedDate.getDate() &&
      m === requestedDate.getMonth() &&
      y === requestedDate.getFullYear()
    );
  };

  return (
    <div className="w-full mx-auto max-w-md bg-white rounded-lg shadow border border-gray-200 p-4">
      <div className="flex justify-center items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          {MONTHS[month]} {year}
        </h2>
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
          const isRequested = isRequestedDate(day, m, y);

          if (!isCurrentMonth) {
            return (
              <div
                key={`other-${index}`}
                className="aspect-square flex items-center justify-center rounded-lg text-sm text-gray-300"
              >
                {day}
              </div>
            );
          }

          return (
            <div
              key={`current-${day}`}
              className={`aspect-square flex flex-col items-center justify-center rounded-lg text-sm relative ${
                isRequested
                  ? "bg-primary text-white font-bold ring-2 ring-primary ring-offset-2"
                  : "text-gray-700"
              }`}
            >
              {day}
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-primary/10 rounded-md text-sm text-gray-700">
        <strong>Data solicitada:</strong>{" "}
        {requestedDate.toLocaleDateString("pt-BR")}
      </div>
    </div>
  );
}
