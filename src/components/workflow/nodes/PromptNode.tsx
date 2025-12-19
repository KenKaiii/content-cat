"use client";

import { memo, useRef, useCallback, useState, useEffect } from "react";
import type { NodeProps, Node } from "@xyflow/react";
import ReactMarkdown from "react-markdown";
import BaseNode from "./BaseNode";
import type { PromptNodeData } from "../types";

const MIN_HEIGHT = 80;
const MAX_HEIGHT = 330;

const PromptNode = memo(function PromptNode({
  data,
  selected,
}: NodeProps<Node<PromptNodeData>>) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [promptText, setPromptText] = useState(data.prompt || "");

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const textarea = e.target;
      setPromptText(textarea.value);

      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = "auto";
      // Set new height, capped at MAX_HEIGHT
      const newHeight = Math.min(
        Math.max(textarea.scrollHeight, MIN_HEIGHT),
        MAX_HEIGHT
      );
      textarea.style.height = `${newHeight}px`;
    },
    []
  );

  const handleWheel = useCallback((e: React.WheelEvent) => {
    // Stop propagation to prevent React Flow zoom
    e.stopPropagation();
  }, []);

  const handleFocus = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
  }, []);

  // Adjust textarea height and cursor position when entering edit mode
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = "auto";
      const newHeight = Math.min(
        Math.max(textarea.scrollHeight, MIN_HEIGHT),
        MAX_HEIGHT
      );
      textarea.style.height = `${newHeight}px`;

      // Focus and place cursor at the end of the text
      textarea.focus();
      textarea.setSelectionRange(textarea.value.length, textarea.value.length);
    }
  }, [isEditing]);

  return (
    <BaseNode
      label={data.label || "Prompt"}
      selected={selected}
      inputs={[]}
      outputs={[{ id: "prompt", label: "Text", color: "#A78BFA" }]}
    >
      <style jsx global>{`
        .prompt-markdown h1 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        .prompt-markdown h2 {
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 0.4rem;
        }
        .prompt-markdown h3 {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 0.3rem;
        }
        .prompt-markdown p {
          margin-bottom: 0.5rem;
        }
        .prompt-markdown ul,
        .prompt-markdown ol {
          padding-left: 1.25rem;
          margin-bottom: 0.5rem;
        }
        .prompt-markdown ul {
          list-style-type: disc;
        }
        .prompt-markdown ol {
          list-style-type: decimal;
        }
        .prompt-markdown li {
          margin-bottom: 0.25rem;
        }
        .prompt-markdown strong {
          font-weight: 600;
        }
        .prompt-markdown em {
          font-style: italic;
        }
        .prompt-markdown code {
          background: rgba(255, 255, 255, 0.1);
          padding: 0.1rem 0.3rem;
          border-radius: 0.25rem;
          font-size: 0.85em;
        }
        .prompt-markdown blockquote {
          border-left: 2px solid #6b7280;
          padding-left: 0.75rem;
          margin-left: 0;
          color: #9ca3af;
        }
        .prompt-markdown::-webkit-scrollbar {
          display: none;
        }
        .prompt-markdown * {
          word-wrap: break-word;
          overflow-wrap: break-word;
          max-width: 100%;
        }
      `}</style>
      <div className="flex w-full max-w-[264px] flex-col">
        {isEditing || !promptText ? (
          <textarea
            ref={textareaRef}
            className="nodrag nowheel w-full resize-none overflow-y-auto rounded-lg p-3 text-sm text-white placeholder-gray-500 focus:outline-none"
            style={{
              backgroundColor: "rgb(31, 31, 35)",
              border: "none",
              minHeight: MIN_HEIGHT,
              maxHeight: MAX_HEIGHT,
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
            placeholder="Describe what you want to generate..."
            value={promptText}
            onChange={handleInput}
            onWheel={handleWheel}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        ) : (
          <div
            className="nodrag nowheel prompt-markdown w-full cursor-text overflow-x-hidden overflow-y-auto rounded-lg p-3 text-sm break-words text-white"
            style={{
              backgroundColor: "rgb(31, 31, 35)",
              minHeight: MIN_HEIGHT,
              maxHeight: MAX_HEIGHT,
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              wordWrap: "break-word",
              overflowWrap: "break-word",
            }}
            onClick={() => setIsEditing(true)}
            onWheel={handleWheel}
          >
            <ReactMarkdown>{promptText}</ReactMarkdown>
          </div>
        )}
      </div>
    </BaseNode>
  );
});

export default PromptNode;
