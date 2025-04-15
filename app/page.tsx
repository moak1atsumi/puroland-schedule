"use client";
import { useState, useEffect, useRef } from "react";

// 型定義を追加
type Event = {
  id: number;
  title: string;
  start: string;
  end: string;
};

const timeSlots = Array.from({ length: 109 }, (_, i) => {
  const totalMinutes = 9 * 60 + i * 5;
  const hour = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;
  return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
});

const durationOptions = Array.from({ length: 6 }, (_, i) => (i + 1) * 5);
const initialTitleOptions = [
  "入園・チケット確認",
  "シナモンのグリーティング",
  "マイメロのライブショー",
  "お昼ごはん",
  "買い物タイム",
  "写真撮影",
  "パレード観賞",
  "お見送り・退園",
];

const titleColors = [
  "bg-blue-200",
  "bg-green-200",
  "bg-yellow-200",
  "bg-orange-200",
  "bg-purple-200",
  "bg-pink-200",
  "bg-red-200",
  "bg-teal-200",
];

export default function Home() {
  const [schedule, setSchedule] = useState<Event[]>([]);
  const [title, setTitle] = useState(initialTitleOptions[0]);
  const [start, setStart] = useState("09:00");
  const [duration, setDuration] = useState(15);
  const [titleOptions, setTitleOptions] = useState(initialTitleOptions);
  const [newTitle, setNewTitle] = useState("");
  const [inputAreaHeight, setInputAreaHeight] = useState(0);
  const [showInputArea, setShowInputArea] = useState(true);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const inputAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedSchedule = localStorage.getItem("scheduleV2");
    if (savedSchedule) {
      setSchedule(JSON.parse(savedSchedule));
    }
  }, []);

  useEffect(() => {
    const savedTitleOptions = localStorage.getItem("titleOptions");
    if (savedTitleOptions) {
      setTitleOptions(JSON.parse(savedTitleOptions));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("scheduleV2", JSON.stringify(schedule));
  }, [schedule]);

  useEffect(() => {
    localStorage.setItem("titleOptions", JSON.stringify(titleOptions));
  }, [titleOptions]);

  useEffect(() => {
    if (inputAreaRef.current) {
      setInputAreaHeight(showInputArea ? inputAreaRef.current.offsetHeight : 40);
    }
  }, [showInputArea, schedule, titleOptions, start, duration, newTitle]);

  const addEvent = () => {
    if (!title.trim()) return;

    const startIdx = timeToIndex(start);
    const endIdx = startIdx + duration / 5;
    const endTime = timeSlots[endIdx] || "18:00";

    const newStart = startIdx;
    const newEnd = endIdx;

    const hasOverlap = schedule.some((e) => {
      const existingStart = timeToIndex(e.start);
      const existingEnd = timeToIndex(e.end);
      return (
        newStart < existingEnd && newEnd > existingStart && e.title !== title
      );
    });

    if (hasOverlap) {
      alert("その時間帯には他の予定があります");
      return;
    }

    const newEvent = { id: Date.now(), title, start, end: endTime };
    setSchedule((prev) => {
      const filtered = prev.filter((e) => e.title !== title);
      return [...filtered, newEvent];
    });
  };

  const resetLocalStorage = () => {
    if (window.confirm("ローカルストレージをリセットしますか？すべてのデータが削除されます。")) {
      localStorage.removeItem("scheduleV2");
      localStorage.removeItem("titleOptions");
      setSchedule([]);
      setTitleOptions(initialTitleOptions);
      setTitle(initialTitleOptions[0]);
    }
  };

  const deleteEvent = (id: number) => {
    setSchedule(schedule.filter((e) => e.id !== id));
  };

  const timeToIndex = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    return Math.round(((h * 60 + m) - 540) / 5);
  };

  const removeTitle = (titleToRemove: string) => {
    setTitleOptions((prevTitles) => prevTitles.filter((t) => t !== titleToRemove));

    setSchedule((prevSchedule) => {
      const updatedSchedule = prevSchedule.filter((e) => e.title !== titleToRemove);
      localStorage.setItem("scheduleV2", JSON.stringify(updatedSchedule));
      return updatedSchedule;
    });

    const updatedTitleOptions = titleOptions.filter((t) => t !== titleToRemove);
    localStorage.setItem("titleOptions", JSON.stringify(updatedTitleOptions));

    if (title === titleToRemove) {
      setTitle(updatedTitleOptions[0] || "");
    }
  };

  const addNewTitle = () => {
    if (newTitle.trim() && !titleOptions.includes(newTitle)) {
      setTitleOptions((prev) => [...prev, newTitle]);
      setNewTitle("");
    }
  };

  const getEventStyle = (event: Event) => {
    const startIdx = timeToIndex(event.start);
    const endIdx = timeToIndex(event.end);
    const top = startIdx * 16;
    const height = (endIdx - startIdx) * 16;

    return {
      top: `${top}px`,
      height: `${height}px`,
      left: `0`,
      right: `0`,
      margin: "auto",
    };
  };

  const saveEditedEvent = () => {
    if (editingEvent) {
      const updatedSchedule = schedule.map((e) =>
        e.id === editingEvent.id ? editingEvent : e
      );
      setSchedule(updatedSchedule);
      setEditingEvent(null);
    }
  };

  const deleteEditedEvent = () => {
    if (editingEvent) {
      deleteEvent(editingEvent.id);
      setEditingEvent(null);
    }
  };

  return (
    <div className="relative p-4 max-w-md mx-auto" style={{ paddingBottom: inputAreaHeight }}>
      <div className="text-center mb-2">
        <img
          src="/pompomprin_512x512.webp"
          alt="ポムポムプリン"
          className="mx-auto w-12 h-12"
        />
      </div>
      <div className="absolute left-0 right-0 bottom-24">
        <img
          src="/list-pompompurin.png"
          alt="ポムポムプリン"
          className="mx-auto w-24 h-24"
        />
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-20">
        <button
          onClick={() => setShowInputArea(!showInputArea)}
          className="w-full bg-yellow-500 text-white py-2 text-sm hover:bg-yellow-600 rounded-t"
        >
          {showInputArea ? "入力欄を閉じる ー" : "入力欄を開く ＋"}
        </button>
      </div>

      {showInputArea && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#FFF5C3] p-4 pb-12 border-t space-y-2 z-10" ref={inputAreaRef}>
          <select
            className="w-full border px-3 py-2 rounded text-sm bg-white"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          >
            {titleOptions.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <select
              className="flex-1 border px-2 py-1 rounded text-sm bg-white"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            >
              {timeSlots.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <select
              className="flex-1 border px-2 py-1 rounded text-sm bg-white"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            >
              {durationOptions.map((d) => (
                <option key={d} value={d}>{d}分</option>
              ))}
            </select>
          </div>
          <button
            onClick={addEvent}
            className="w-full bg-pink-500 text-white py-2 rounded text-sm hover:bg-pink-600"
          >
            予定を追加
          </button>
          <button
            onClick={resetLocalStorage}
            className="w-full bg-red-500 text-white py-2 rounded text-sm hover:bg-red-600"
          >
            リセット
          </button>
          <div className="mt-4 flex gap-2">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="flex-1 border px-3 py-2 rounded text-sm bg-white"
              placeholder="新しいタイトルを追加"
            />
            <button
              onClick={addNewTitle}
              className="bg-green-500 text-white py-2 px-4 rounded text-sm hover:bg-green-600"
            >
              追加
            </button>
          </div>
        </div>
      )}

      <div className="text-center text-sm font-bold mb-2 mt-1">スケジュール一覧</div>

      <div className="relative border-t border-b" style={{ height: `${timeSlots.length * 16}px` }}>
        {timeSlots.map((time, index) => (
          <div
            key={time}
            className={`relative border-b ${time.endsWith(":00") ? "border-t-2 border-black" : ""}`}
            style={{ height: "16px" }}
          >
            {index % 12 === 0 && (
              <div className="absolute left-0 text-xs text-gray-500" style={{ top: "-12px", left: "calc(-1em - 3px)" }}>{time.split(":")[0]}</div>
            )}
          </div>
        ))}

        {schedule.map((event) => {
          const style = getEventStyle(event);
          const colorClass = titleColors[titleOptions.indexOf(event.title) % titleColors.length];
          return (
            <div
              key={event.id}
              className={`absolute ${colorClass} rounded text-sm overflow-hidden shadow px-2 py-1 cursor-pointer`}
              style={style}
              onClick={() => setEditingEvent(event)}
            >
              <div className="text-xs font-bold text-center">{event.title}</div>
              <div className="text-xs text-center">{event.start} - {event.end}</div>
              <button
                className="absolute top-1 right-1 text-white text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteEvent(event.id);
                }}
              >
                ×
              </button>
            </div>
          );
        })}
      </div>

      {editingEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded shadow max-w-sm w-full space-y-2">
            <h2 className="text-center font-bold mb-2">予定を編集</h2>
            <input
              className="w-full border px-2 py-1 rounded"
              value={editingEvent.title}
              onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
            />
            <div className="flex gap-2">
              <select
                className="flex-1 border px-2 py-1 rounded"
                value={editingEvent.start}
                onChange={(e) => setEditingEvent({ ...editingEvent, start: e.target.value })}
              >
                {timeSlots.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <select
                className="flex-1 border px-2 py-1 rounded"
                value={timeToIndex(editingEvent.end) - timeToIndex(editingEvent.start)}
                onChange={(e) => {
                  const duration = Number(e.target.value);
                  const endIdx = timeToIndex(editingEvent.start) + duration;
                  const newEnd = timeSlots[endIdx] || "18:00";
                  setEditingEvent({ ...editingEvent, end: newEnd });
                }}
              >
                {durationOptions.map((d) => (
                  <option key={d} value={d / 5}>{d}分</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button
                className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                onClick={saveEditedEvent}
              >
                保存
              </button>
              <button
                className="flex-1 bg-red-500 text-white py-2 rounded hover:bg-red-600"
                onClick={deleteEditedEvent}
              >
                削除
              </button>
            </div>
            <button
              className="w-full mt-2 text-sm text-gray-600 underline"
              onClick={() => setEditingEvent(null)}
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
