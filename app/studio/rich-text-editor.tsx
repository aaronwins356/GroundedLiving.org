"use client";

import { useCallback, useEffect, useRef } from "react";

import { Button } from "../../components/ui/button";
import type { RichTextDocument } from "../../types/contentful";
import { htmlToRichText, richTextToHtml } from "./rich-text-utils";

interface RichTextEditorProps {
  value: RichTextDocument | null;
  onChange: (value: RichTextDocument) => void;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!editorRef.current) {
      return;
    }

    const html = richTextToHtml(value);
    if (html !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = html || `<p><br /></p>`;
    }
  }, [value]);

  const emitChange = useCallback(() => {
    if (!editorRef.current) {
      return;
    }
    const documentValue = htmlToRichText(editorRef.current.innerHTML);
    onChange(documentValue);
  }, [onChange]);

  const runCommand = useCallback((command: string, valueArg?: string) => {
    document.execCommand(command, false, valueArg);
    emitChange();
  }, [emitChange]);

  const handleLink = useCallback(() => {
    const url = window.prompt("Enter URL");
    if (!url) {
      return;
    }
    runCommand("createLink", url);
  }, [runCommand]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200/70 bg-white/70 p-2 shadow-inner dark:border-slate-800/70 dark:bg-slate-900/70">
        <Button type="button" variant="ghost" size="sm" onClick={() => runCommand("bold")}>B</Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => runCommand("italic")}><em>I</em></Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => runCommand("underline")}><span className="underline">U</span></Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => runCommand("formatBlock", "h2")}>
          H2
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => runCommand("formatBlock", "p")}>
          ¶
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => runCommand("insertUnorderedList")}>• List</Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => runCommand("insertOrderedList")}>1. List</Button>
        <Button type="button" variant="ghost" size="sm" onClick={handleLink}>
          Link
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => runCommand("removeFormat")}>Clear</Button>
      </div>
      <div
        ref={(element) => {
          editorRef.current = element;
        }}
        className="min-h-[240px] rounded-2xl border border-slate-200/70 bg-white/80 p-5 text-sm leading-relaxed shadow-sm focus-within:border-emerald-400 focus-within:shadow-emerald-200/40 empty:before:pointer-events-none empty:before:text-slate-400 empty:before:content-[attr(data-placeholder)] dark:border-slate-800/70 dark:bg-slate-900/60"
        contentEditable
        suppressContentEditableWarning
        onInput={emitChange}
        onBlur={emitChange}
        data-placeholder={placeholder ?? "Start writing rich content..."}
      />
    </div>
  );
}
