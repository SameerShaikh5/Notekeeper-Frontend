import React, { useRef, useEffect } from "react";
import type { Block } from "../../context/NotesContext";

interface TextBlockProps {
  block: Block;
  topicId: string;
  updateBlock: (topicId: string, blockId: string, updates: Partial<Block>) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  autoFocus?: boolean;
}

export const TextBlock: React.FC<TextBlockProps> = ({ block, topicId, updateBlock, onKeyDown, autoFocus }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
      // place cursor at end
      textareaRef.current.setSelectionRange(textareaRef.current.value.length, textareaRef.current.value.length);
    }
  }, [autoFocus]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
    updateBlock(topicId, block.id, { content: e.target.value });
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [block.content]);

  return (
    <textarea
      ref={textareaRef}
      value={block.content}
      onChange={handleInput}
      onKeyDown={onKeyDown}
      placeholder="Type '/' for commands or start writing..."
      className="w-full bg-transparent border-none outline-none resize-none overflow-hidden text-foreground text-base leading-relaxed placeholder:text-muted-foreground/50 py-1"
      rows={1}
    />
  );
};
