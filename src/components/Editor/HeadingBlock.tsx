import React, { useRef, useEffect } from "react";
import type { Block } from "../../context/NotesContext";

interface HeadingBlockProps {
  block: Block;
  topicId: string;
  updateBlock: (topicId: string, blockId: string, updates: Partial<Block>) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  autoFocus?: boolean;
}

export const HeadingBlock: React.FC<HeadingBlockProps> = ({ block, topicId, updateBlock, onKeyDown, autoFocus }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  return (
    <input
      ref={inputRef}
      value={block.content}
      onChange={(e) => updateBlock(topicId, block.id, { content: e.target.value })}
      onKeyDown={onKeyDown}
      placeholder="Heading"
      className="w-full bg-transparent border-none outline-none text-foreground font-bold text-2xl py-2 mt-4 mb-2 placeholder:text-muted-foreground/50"
    />
  );
};
