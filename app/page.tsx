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
  const [schedule, setSchedule] = useState<Event[]>([]); // 型を指定
  const [title, setTitle] = useState(initialTitleOptions[0]);
  const [start, setStart] = useState("09:00");
  const [duration, setDuration] = useState(15);
  const [titleOptions, setTitleOptions] = useState(initialTitleOptions);
  const [newTitle, setNewTitle] = useState(""); // 新しいタイトルを管理するためのステート
  const [inputAreaHeight, setInputAreaHeight] = useState(0); // 入力エリアの高さを管理するステート
  const inputAreaRef = useRef<HTMLDivElement>(null); // 入力エリアの高さを取得するためのref

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
    // scheduleが変更されたらローカルストレージを更新
    localStorage.setItem("scheduleV2", JSON.stringify(schedule));
  }, [schedule]);

  useEffect(() => {
    // titleOptionsが変更されたらローカルストレージを更新
    localStorage.setItem("titleOptions", JSON.stringify(titleOptions));
  }, [titleOptions]);

  useEffect(() => {
    // 入力エリアの高さを動的に取得
    if (inputAreaRef.current) {
      setInputAreaHeight(inputAreaRef.current.offsetHeight);
    }
  }, [schedule, titleOptions, start, duration, newTitle]);

  const addEvent = () => {
    if (!title.trim()) return;

    const startIdx = timeToIndex(start);
    const endIdx = startIdx + duration / 5;
    const endTime = timeSlots[endIdx] || "18:00";

    const newEvent = { id: Date.now(), title, start, end: endTime };
    setSchedule((prev) => {
      const filtered = prev.filter((e) => e.title !== title); // タイトルの重複を防ぐ
      return [...filtered, newEvent];
    });
  };

  const clearLocalStorage = () => {
    localStorage.removeItem("scheduleV2");
    localStorage.removeItem("titleOptions");
    setSchedule([]);
    setTitleOptions(initialTitleOptions);
    setTitle(initialTitleOptions[0]); // 初期タイトルに戻す
  };

  const deleteEvent = (id: number) => {
    setSchedule(schedule.filter((e) => e.id !== id));
  };

  const timeToIndex = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    return Math.round(((h * 60 + m) - 540) / 5);
  };

  const removeTitle = (titleToRemove: string) => {
    // タイトルを削除し、そのタイトルに関連する予定も削除
    setTitleOptions((prevTitles) =>
      prevTitles.filter((t) => t !== titleToRemove)
    );

    // scheduleから削除されたタイトルの予定も削除
    setSchedule((prevSchedule) => {
      const updatedSchedule = prevSchedule.filter((e) => e.title !== titleToRemove);
      // ローカルストレージを更新
      localStorage.setItem("scheduleV2", JSON.stringify(updatedSchedule));
      return updatedSchedule;
    });

    // titleOptionsもローカルストレージに保存
    const updatedTitleOptions = titleOptions.filter((t) => t !== titleToRemove);
    localStorage.setItem("titleOptions", JSON.stringify(updatedTitleOptions));

    // 現在選択されているタイトルが削除されたタイトルでない場合、選択されているタイトルを更新
    if (title === titleToRemove) {
      setTitle(updatedTitleOptions[0] || ""); // 削除後に最初のタイトルを選択
    }
  };

  // 新しいタイトルを追加する関数
  const addNewTitle = () => {
    if (newTitle.trim() && !titleOptions.includes(newTitle)) {
      setTitleOptions((prev) => [...prev, newTitle]);
      setNewTitle(""); // 追加後に入力フォームをリセット
    }
  };

  const totalHeight = timeSlots.length * 16;
  const columnWidth = 100 / titleOptions.length;

  const getEventStyle = (event: Event, col: number) => {
    const startIdx = timeToIndex(event.start);
    const endIdx = timeToIndex(event.end);
    const top = startIdx * 16;
    const height = (endIdx - startIdx) * 16;

    // 予定ボックスのleftに関する変更なし
    const left = `${col * columnWidth}%`;

    return {
      top: `${top}px`,
      height: `${height}px`,
      left: left,  // leftの変更なし
      width: `${columnWidth}%`,
    };
  };

  const getColumn = (title: string) => {
    return titleOptions.indexOf(title);
  };

  return (
    <div className="p-4 max-w-md mx-auto" style={{ paddingBottom: inputAreaHeight }}>
      {/* 入力フォーム（固定） */}
      <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t space-y-2 z-10" ref={inputAreaRef}>
        <select
          className="w-full border px-3 py-2 rounded text-sm"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        >
          {titleOptions.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <select
            className="flex-1 border px-2 py-1 rounded text-sm"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          >
            {timeSlots.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <select
            className="flex-1 border px-2 py-1 rounded text-sm"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
          >
            {durationOptions.map((d) => (
              <option key={d} value={d}>
                {d}分
              </option>
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
          onClick={clearLocalStorage}
          className="w-full bg-red-500 text-white py-2 rounded text-sm hover:bg-red-600"
        >
          ローカルストレージをクリア
        </button>

        {/* 新しいタイトルを追加するフォーム（入力エリア内） */}
        <div className="mt-4 flex gap-2">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="flex-1 border px-3 py-2 rounded text-sm"
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

      {/* 表見出し（スクロール時固定） */}
      <div className="flex text-xs mb-1 border-b sticky top-0 bg-white z-10">
        {titleOptions.map((t, i) => (
          <div
            key={t}
            className="text-center border-r last:border-r-0 border-gray-300 relative flex flex-col"
            style={{ width: `${columnWidth}%` }}
          >
            {t}
            <div className="flex-grow"></div> {/* 空のスペースを追加して下に押し出します */}
            <button
              className="bg-red-500 text-white text-xs py-1 px-2 rounded w-full"
              onClick={() => removeTitle(t)}
            >
              削除
            </button>
          </div>
        ))}
      </div>

      <div className="relative border-t border-b" style={{ height: `${totalHeight}px` }}>
        {/* 縦の列の仕切り線 */}
        {titleOptions.map((_, i) => (
          <div
            key={i}
            className="absolute top-0 bottom-0 border-r border-gray-300"
            style={{ left: `${(i + 1) * columnWidth}%` }}
          />
        ))}

        {timeSlots.map((time, index) => (
          <div
            key={time}
            className={`relative border-b ${time.endsWith(":00") ? "border-t-2 border-black" : ""}`}
            style={{ height: '16px' }}
          >
            {/* 1時間単位の時間を追記 */}
            {index % 12 === 0 && (
              <div
                className="absolute left-0 text-xs text-gray-500"
                style={{ top: '-12px', left: 'calc(-1em - 2px)' }} // calcで調整
              >
                {time.split(":")[0]}
              </div>
            )}
          </div>
        ))}

        {/* スケジュールボックス */}
        {schedule.map((event) => {
          const col = getColumn(event.title);
          const style = getEventStyle(event, col);
          const colorClass = titleColors[col % titleColors.length];
          return (
            <div
              key={event.id}
              className={`absolute ${colorClass} rounded text-sm overflow-hidden shadow`}
              style={style}
            >
              <button
                className="absolute top-1 right-1 text-white text-lg"
                onClick={() => deleteEvent(event.id)}
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
