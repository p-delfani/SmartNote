
import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Lock,
  Bell,
  FileText,
  Clock3,
} from "lucide-react";

function getLocalDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseLocalDate(value) {
  if (!value) return null;

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

function CalendarView({
  notes = [],
  isPersian = false,
  isDarkMode = false,
  onOpenNote,
}) {
  const today = new Date();

  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const [selectedDate, setSelectedDate] = useState(
    getLocalDateKey(today)
  );

  const firstDay = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  );

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const monthName = new Intl.DateTimeFormat(
    isPersian ? "fa-IR-u-ca-persian" : "en-US",
    {
      month: "long",
      year: "numeric",
    }
  ).format(currentMonth);

  const weekdays = isPersian
    ? ["ش", "ی", "د", "س", "چ", "پ", "ج"]
    : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getDateNumber = (day) =>
    new Intl.NumberFormat(isPersian ? "fa-IR" : "en-US").format(day);

  const dateCells = useMemo(() => {
    const offset = isPersian
      ? (firstDay.getDay() + 1) % 7
      : firstDay.getDay();

    const cells = [];

    for (let i = 0; i < offset; i++) {
      cells.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      cells.push(day);
    }

    return cells;
  }, [
    currentMonth,
    isPersian,
    daysInMonth,
    firstDay.getDay(),
  ]);

  const notesByDate = useMemo(() => {
    const result = {};

    notes
      .filter((note) => !note.isTrashed)
      .forEach((note) => {
        const createdDate = parseLocalDate(
          note.createdAt || note.updatedAt
        );

        const reminderDate = parseLocalDate(note.reminderAt);

        if (createdDate) {
          const key = getLocalDateKey(createdDate);

          if (!result[key]) result[key] = [];

          result[key].push({
            note,
            type: "note",
            date: createdDate,
          });
        }

        if (reminderDate) {
          const key = getLocalDateKey(reminderDate);

          if (!result[key]) result[key] = [];

          result[key].push({
            note,
            type: "reminder",
            date: reminderDate,
          });
        }
      });

    return result;
  }, [notes]);

  const selectedItems = notesByDate[selectedDate] || [];

  const selectedDateObject = useMemo(() => {
    const [year, month, day] = selectedDate
      .split("-")
      .map(Number);

    return new Date(year, month - 1, day);
  }, [selectedDate]);

  const selectedDateLabel = new Intl.DateTimeFormat(
    isPersian ? "fa-IR" : "en-US",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  ).format(selectedDateObject);

  const isToday = (day) =>
    day === today.getDate() &&
    currentMonth.getMonth() === today.getMonth() &&
    currentMonth.getFullYear() === today.getFullYear();

  function changeMonth(amount) {
    setCurrentMonth(
      new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + amount,
        1
      )
    );
  }

  function goToToday() {
    setCurrentMonth(
      new Date(today.getFullYear(), today.getMonth(), 1)
    );
    setSelectedDate(getLocalDateKey(today));
  }

  const colors = {
    background: isDarkMode ? "#171923" : "#ffffff",
    surface: isDarkMode ? "#202331" : "#f8f9fc",
    text: isDarkMode ? "#f1f2f8" : "#202438",
    muted: isDarkMode ? "#9ca3b8" : "#858ba0",
    border: isDarkMode ? "#343849" : "#e9ebf2",
    accent: "#7567e8",
    accentSoft: isDarkMode ? "#34304f" : "#efedff",
  };

  const cardStyle = {
    background: colors.background,
    border: `1px solid ${colors.border}`,
    borderRadius: "18px",
    padding: "20px",
  };

  return (
    <section
      className="calendar-page"
      dir={isPersian ? "rtl" : "ltr"}
      style={{
        color: colors.text,
        display: "grid",
        gridTemplateColumns: "minmax(0, 1.7fr) minmax(260px, 1fr)",
        gap: "20px",
        alignItems: "start",
        paddingBottom: "30px",
      }}
    >
      <div style={cardStyle}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            flexWrap: "wrap",
            marginBottom: "24px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <CalendarDays size={23} color={colors.accent} />
            <h2 style={{ fontSize: "20px", margin: 0 }}>
              {isPersian ? "تقویم یادداشت‌ها" : "Notes Calendar"}
            </h2>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              onClick={goToToday}
              style={{
                border: `1px solid ${colors.border}`,
                background: colors.surface,
                color: colors.text,
                borderRadius: "9px",
                padding: "8px 12px",
                cursor: "pointer",
              }}
            >
              {isPersian ? "امروز" : "Today"}
            </button>

            <button
              onClick={() => changeMonth(-1)}
              aria-label="Previous month"
              style={{
                border: `1px solid ${colors.border}`,
                background: colors.surface,
                color: colors.text,
                borderRadius: "9px",
                padding: "8px",
                cursor: "pointer",
                display: "grid",
                placeItems: "center",
              }}
            >
              {isPersian ? (
                <ChevronRight size={19} />
              ) : (
                <ChevronLeft size={19} />
              )}
            </button>

            <button
              onClick={() => changeMonth(1)}
              aria-label="Next month"
              style={{
                border: `1px solid ${colors.border}`,
                background: colors.surface,
                color: colors.text,
                borderRadius: "9px",
                padding: "8px",
                cursor: "pointer",
                display: "grid",
                placeItems: "center",
              }}
            >
              {isPersian ? (
                <ChevronLeft size={19} />
              ) : (
                <ChevronRight size={19} />
              )}
            </button>
          </div>
        </div>

        <h3
          style={{
            textAlign: "center",
            fontSize: "18px",
            fontWeight: 600,
            marginBottom: "22px",
          }}
        >
          {monthName}
        </h3>

        <div
          className="calendar-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
            gap: "7px",
          }}
        >
          {weekdays.map((day) => (
            <div
              key={day}
              style={{
                textAlign: "center",
                color: colors.muted,
                fontSize: "13px",
                fontWeight: 600,
                padding: "8px 0",
              }}
            >
              {day}
            </div>
          ))}

          {dateCells.map((day, index) => {
            if (!day) {
              return <div key={`empty-${index}`} />;
            }

            const date = new Date(
              currentMonth.getFullYear(),
              currentMonth.getMonth(),
              day
            );

            const dateKey = getLocalDateKey(date);
            const hasItems = Boolean(notesByDate[dateKey]?.length);
            const selected = selectedDate === dateKey;
            const todayCell = isToday(day);

            return (
              <button
                key={dateKey}
                onClick={() => setSelectedDate(dateKey)}
                style={{
                  minWidth: 0,
                  minHeight: "66px",
                  border: selected
                    ? `2px solid ${colors.accent}`
                    : `1px solid ${colors.border}`,
                  borderRadius: "12px",
                  background: selected
                    ? colors.accentSoft
                    : todayCell
                      ? colors.surface
                      : colors.background,
                  color: selected ? colors.accent : colors.text,
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "7px",
                  fontSize: "14px",
                  fontWeight: selected || todayCell ? 700 : 500,
                }}
              >
                <span>{getDateNumber(day)}</span>

                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: hasItems ? colors.accent : "transparent",
                  }}
                />
              </button>
            );
          })}
        </div>

        <div
          style={{
            display: "flex",
            gap: "16px",
            flexWrap: "wrap",
            marginTop: "20px",
            color: colors.muted,
            fontSize: "12px",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: colors.accent,
              }}
            />
            {isPersian ? "دارای یادداشت یا یادآوری" : "Notes or reminders"}
          </span>
        </div>
      </div>

      <aside style={cardStyle}>
        <h3 style={{ fontSize: "16px", margin: "0 0 6px" }}>
          {isPersian ? "برنامه روز" : "Daily overview"}
        </h3>

        <p
          style={{
            color: colors.muted,
            fontSize: "13px",
            margin: "0 0 20px",
          }}
        >
          {selectedDateLabel}
        </p>

        {selectedItems.length === 0 ? (
          <div
            style={{
              background: colors.surface,
              borderRadius: "13px",
              padding: "24px 14px",
              textAlign: "center",
              color: colors.muted,
            }}
          >
            <CalendarDays
              size={28}
              style={{ marginBottom: "10px", opacity: 0.65 }}
            />
            <p style={{ fontSize: "13px", margin: 0 }}>
              {isPersian
                ? "برای این روز یادداشت یا یادآوری ثبت نشده است."
                : "No notes or reminders for this day."}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {selectedItems.map((item, index) => {
              const note = item.note;

              const title = note.isPrivate
                ? isPersian
                  ? "یادداشت خصوصی"
                  : "Private note"
                : note.title ||
                  (isPersian ? "بدون عنوان" : "Untitled note");

              return (
                <button
                  key={`${note.id}-${item.type}-${index}`}
                  onClick={() => onOpenNote?.(note.id)}
                  style={{
                    width: "100%",
                    textAlign: isPersian ? "right" : "left",
                    display: "flex",
                    alignItems: "center",
                    gap: "11px",
                    padding: "13px",
                    border: `1px solid ${colors.border}`,
                    borderRadius: "12px",
                    background: colors.surface,
                    color: colors.text,
                    cursor: "pointer",
                  }}
                >
                  <span
                    style={{
                      width: "36px",
                      height: "36px",
                      flexShrink: 0,
                      display: "grid",
                      placeItems: "center",
                      borderRadius: "10px",
                      background: colors.accentSoft,
                      color: colors.accent,
                    }}
                  >
                    {note.isPrivate ? (
                      <Lock size={17} />
                    ) : item.type === "reminder" ? (
                      <Bell size={17} />
                    ) : (
                      <FileText size={17} />
                    )}
                  </span>

                  <span style={{ minWidth: 0, flex: 1 }}>
                    <span
                      style={{
                        display: "block",
                        fontSize: "13px",
                        fontWeight: 600,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {title}
                    </span>

                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        color: colors.muted,
                        fontSize: "11px",
                        marginTop: "5px",
                      }}
                    >
                      {item.type === "reminder" ? (
                        <Bell size={12} />
                      ) : (
                        <Clock3 size={12} />
                      )}

                      {item.type === "reminder"
                        ? isPersian
                          ? "یادآوری"
                          : "Reminder"
                        : isPersian
                          ? "یادداشت"
                          : "Note"}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </aside>
    </section>
  );
}

export default CalendarView;
