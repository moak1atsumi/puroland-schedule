"use client";
import { useState, useEffect } from "react";

const timeSlots = Array.from({ length: 36 }, (_, i) => {
  const hour = 9 + Math.floor(i / 4);
  const minute = (i % 4) * 15;
  return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
});

export default function Home() {
  const [schedule, setSchedule] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("schedule");
      return saved ? JSON.parse(saved) : Array(36).fill("");
    }
    return Array(36).fill("");
  });

  useEffect(() => {
    localStorage.setItem("schedule", JSON.stringify(schedule));
  }, [schedule]);

  const handleChange = (index: number, value: string) => {
    const updated = [...schedule];
    updated[index] = value;
    setSchedule(updated);
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">ピューロランド スケジュール！</h1>
      <div className="space-y-2">
        {timeSlots.map((time, index) => (
          <div key={time} className="flex items-center">
            <div className="w-20 text-sm text-gray-600">{time}</div>
            <input
              type="text"
              value={schedule[index]}
              onChange={(e) => handleChange(index, e.target.value)}
              className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
              placeholder="予定を入力"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
