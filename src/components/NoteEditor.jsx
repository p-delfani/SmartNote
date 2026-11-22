
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  FileText,
  Check,
  Folder,
  Tag,
  Bell,
  X,
  LockKeyhole,
  ShieldCheck,
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Link,
  Eye,
  Code,
} from "lucide-react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const noteColors = [
  { name: "purple", color: "#DCCBFA" },
  { name: "pink", color: "#F8C9D8" },
  { name: "orange", color: "#FFD6BE" },
  { name: "yellow", color: "#F9E7A8" },
  { name: "green", color: "#C7EBD5" },
  { name: "blue", color: "#C7E2F8" },
  { name: "lavender", color: "#D5D5F5" },
  { name: "coral", color: "#F6C5BC" },
  { name: "mint", color: "#BDE8E5" },
];

const availableTags = [
  "Work",
  "Personal",
  "Ideas",
  "Finance",
  "Health",
];

function NoteEditor({
  note,
  onUpdateNote,
  folders = [],
  onMakePrivate,
  onLock,
  isUnlocked = false,
}) {
  const { t, i18n } = useTranslation();
  const isPersian = i18n.language === "fa";

  const contentRef = useRef(null);
  const [previewMode, setPreviewMode] = useState(false);

  if (!note) {
    return (
      <section className="note-editor empty-editor">
        <FileText size={45} />
        <h2>{t("notes.selectNote")}</h2>
        <p>{t("notes.selectNoteHint")}</p>
      </section>
    );
  }

  function updateField(field, value) {
    onUpdateNote({
      ...note,
      [field]: value,
    });
  }

  function toggleTag(tag) {
    const currentTags = note.tags || [];

    const updatedTags = currentTags.includes(tag)
      ? currentTags.filter((item) => item !== tag)
      : [...currentTags, tag];

    updateField("tags", updatedTags);
  }

  function formatDateTimeLocal(value) {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    const offset = date.getTimezoneOffset() * 60000;

    return new Date(date.getTime() - offset)
      .toISOString()
      .slice(0, 16);
  }

  function handleReminderChange(value) {
    updateField(
      "reminderAt",
      value ? new Date(value).toISOString() : null
    );
  }

  function insertMarkdown(
    before,
    after = "",
    placeholder = "متن"
  ) {
    const textarea = contentRef.current;

    if (!textarea || previewMode) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const content = note.content || "";
    const selectedText =
      content.slice(start, end) || placeholder;

    const newText =
      content.slice(0, start) +
      before +
      selectedText +
      after +
      content.slice(end);

    updateField("content", newText);

    requestAnimationFrame(() => {
      if (!contentRef.current) return;

      contentRef.current.focus();

      const cursorStart = start + before.length;
      const cursorEnd = cursorStart + selectedText.length;

      contentRef.current.setSelectionRange(
        cursorStart,
        cursorEnd
      );
    });
  }

  function insertLinePrefix(prefix) {
    const textarea = contentRef.current;

    if (!textarea || previewMode) return;

    const content = note.content || "";
    const start = textarea.selectionStart;

    const lineStart = content.lastIndexOf("\n", start - 1) + 1;

    const newText =
      content.slice(0, lineStart) +
      prefix +
      content.slice(lineStart);

    updateField("content", newText);

    requestAnimationFrame(() => {
      if (!contentRef.current) return;

      contentRef.current.focus();

      const newPosition = start + prefix.length;

      contentRef.current.setSelectionRange(
        newPosition,
        newPosition
      );
    });
  }

  function toolbarButton(icon, label, action) {
    return (
      <button
        type="button"
        className="markdown-toolbar-button"
        title={label}
        aria-label={label}
        disabled={previewMode}
        onMouseDown={(event) => event.preventDefault()}
        onClick={action}
      >
        {icon}
      </button>
    );
  }

  return (
    <section className="note-editor">

      {/* Private note security */}
      <div
        className="private-note-control"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: "12px",
          marginBottom: "28px",
        }}
      >
        {note.isPrivate ? (
          <button
            type="button"
            className="private-note-button"
            onClick={() => onLock?.(note.id)}
            disabled={!isUnlocked || !onLock}
          >
            <LockKeyhole size={17} />
            {isPersian ? "قفل‌کردن یادداشت" : "Lock note"}
          </button>
        ) : (
          <button
            type="button"
            className="private-note-button"
            onClick={() => onMakePrivate?.(note)}
            disabled={!onMakePrivate}
          >
            <ShieldCheck size={17} />
            {isPersian
              ? "خصوصی‌کردن یادداشت"
              : "Make note private"}
          </button>
        )}

        {note.isPrivate && (
          <p className="private-note-hint">
            <LockKeyhole size={14} />
            {isPersian
              ? "این یادداشت با رمز عبور محافظت می‌شود."
              : "This note is protected by a password."}
          </p>
        )}
      </div>

      {/* Note colors */}
      <div className="note-color-picker">
        <span>{t("notes.noteColor")}</span>

        <div className="color-options">
          {noteColors.map((item) => (
            <button
              key={item.name}
              type="button"
              className={`color-option ${
                (note.color || "purple") === item.name
                  ? "active"
                  : ""
              }`}
              style={{ backgroundColor: item.color }}
              title={t(`colors.${item.name}`)}
              aria-label={t(`colors.${item.name}`)}
              onClick={() => updateField("color", item.name)}
            >
              {(note.color || "purple") === item.name && (
                <Check size={15} color="#51475C" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Folder */}
      <div className="editor-folder-control">
        <label>
          <Folder size={16} />
          {t("notes.folder")}
        </label>

        <select
          value={note.folderId ?? ""}
          onChange={(event) =>
            updateField(
              "folderId",
              event.target.value
                ? Number(event.target.value)
                : null
            )
          }
        >
          <option value="">{t("notes.noFolder")}</option>

          {folders.map((folder) => (
            <option key={folder.id} value={folder.id}>
              {folder.name}
            </option>
          ))}
        </select>
      </div>

      {/* Tags */}
      <div className="editor-tags-control">
        <label>
          <Tag size={16} />
          {t("notes.tags")}
        </label>

        <div className="editor-tag-options">
          {availableTags.map((tag) => (
            <button
              key={tag}
              type="button"
              className={`editor-tag ${
                (note.tags || []).includes(tag) ? "active" : ""
              }`}
              onClick={() => toggleTag(tag)}
            >
              {t(`tags.${tag}`)}

              {(note.tags || []).includes(tag) && (
                <Check size={13} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Reminder */}
      <div className="editor-reminder-control">
        <label>
          <Bell size={16} />
          {isPersian ? "یادآوری" : "Reminder"}
        </label>

        <div className="reminder-input-row">
          <input
            type="datetime-local"
            value={formatDateTimeLocal(note.reminderAt)}
            min={formatDateTimeLocal(new Date().toISOString())}
            onChange={(event) =>
              handleReminderChange(event.target.value)
            }
          />

          {note.reminderAt && (
            <button
              type="button"
              className="reminder-clear-button"
              onClick={() => updateField("reminderAt", null)}
              title={isPersian ? "حذف یادآوری" : "Remove reminder"}
            >
              <X size={16} />
              {isPersian ? "حذف" : "Clear"}
            </button>
          )}
        </div>

        {note.reminderAt && (
          <p className="reminder-hint">
            <Bell size={13} />
            {isPersian
              ? `زمان یادآوری: ${new Date(note.reminderAt).toLocaleString("fa-IR")}`
              : `Reminder: ${new Date(note.reminderAt).toLocaleString("en-US")}`}
          </p>
        )}
      </div>

      {/* Note title */}
      <input
        className="note-title-input"
        type="text"
        placeholder={t("notes.noteTitlePlaceholder")}
        value={note.title || ""}
        onChange={(event) =>
          updateField("title", event.target.value)
        }
      />

      {/* Markdown editor */}
      <div className="markdown-editor">

        {/* Toolbar */}
        <div className="markdown-toolbar">
          {toolbarButton(
            <Bold size={17} />,
            "Bold",
            () => insertMarkdown("**", "**")
          )}

          {toolbarButton(
            <Italic size={17} />,
            "Italic",
            () => insertMarkdown("*", "*")
          )}

          {toolbarButton(
            <Strikethrough size={17} />,
            "Strikethrough",
            () => insertMarkdown("~~", "~~")
          )}

          <span className="toolbar-divider" />

          {toolbarButton(
            <Heading1 size={18} />,
            "Heading 1",
            () => insertLinePrefix("# ")
          )}

          {toolbarButton(
            <Heading2 size={18} />,
            "Heading 2",
            () => insertLinePrefix("## ")
          )}

          <span className="toolbar-divider" />

          {toolbarButton(
            <List size={17} />,
            "Bullet list",
            () => insertLinePrefix("- ")
          )}

          {toolbarButton(
            <ListOrdered size={17} />,
            "Numbered list",
            () => insertLinePrefix("1. ")
          )}

          {toolbarButton(
            <Link size={17} />,
            "Link",
            () =>
              insertMarkdown(
                "[",
                "](https://example.com)",
                "متن لینک"
              )
          )}

          {toolbarButton(
            <Code size={17} />,
            "Inline code",
            () => insertMarkdown("`", "`")
          )}

          <span className="toolbar-divider" />

          <button
            type="button"
            className={`markdown-toolbar-button preview-toggle ${
              previewMode ? "active" : ""
            }`}
            title={isPersian ? "پیش‌نمایش" : "Preview"}
            aria-label={isPersian ? "پیش‌نمایش" : "Preview"}
            aria-pressed={previewMode}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => setPreviewMode((prev) => !prev)}
          >
            <Eye size={17} />
            <span>
              {isPersian ? "پیش‌نمایش" : "Preview"}
            </span>
          </button>
        </div>

        {/* Editor / Preview */}
        {previewMode ? (
          <div
            className="markdown-preview note-content-input"
            dir={isPersian ? "rtl" : "ltr"}
          >
            {note.content?.trim() ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  a: ({ ...props }) => (
                    <a
                      {...props}
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  ),
                }}
              >
                {note.content}
              </ReactMarkdown>
            ) : (
              <p className="markdown-empty-preview">
                {isPersian
                  ? "هنوز متنی برای نمایش وجود ندارد."
                  : "Nothing to preview yet."}
              </p>
            )}
          </div>
        ) : (
          <textarea
            ref={contentRef}
            className="note-content-input"
            placeholder={t("notes.noteContentPlaceholder")}
            value={note.content || ""}
            dir={isPersian ? "rtl" : "ltr"}
            onChange={(event) =>
              updateField("content", event.target.value)
            }
          />
        )}
      </div>
    </section>
  );
}

export default NoteEditor;
