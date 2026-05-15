import React, { useState } from "react";
import type { Block } from "../../context/NotesContext";
import _Editor from "react-simple-code-editor";
const Editor = (_Editor as any).default || _Editor;
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-css";
import "prismjs/components/prism-json";
import "prismjs/components/prism-bash";
import { Copy, Check } from "lucide-react";

interface CodeBlockProps {
  block: Block;
  topicId: string;
  updateBlock: (topicId: string, blockId: string, updates: Partial<Block>) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ block, topicId, updateBlock, onKeyDown }) => {
  const [copied, setCopied] = useState(false);
  const lang = block.language || "javascript";

  const handleCopy = () => {
    navigator.clipboard.writeText(block.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const highlightWithLineNumbers = (input: string, language: string) => {
    try {
      return Prism.highlight(input, Prism.languages[language] || Prism.languages.javascript, language);
    } catch (e) {
      return input;
    }
  };

  return (
    <div className="my-4 rounded-md overflow-hidden border border-border bg-[#1d1f21]">
      <div className="flex items-center justify-between px-4 py-2 bg-black/40 border-b border-border/50">
        <select
          value={lang}
          onChange={(e) => updateBlock(topicId, block.id, { language: e.target.value })}
          className="bg-transparent text-xs text-muted-foreground outline-none cursor-pointer hover:text-foreground transition-colors"
        >
          <option value="javascript">JavaScript</option>
          <option value="typescript">TypeScript</option>
          <option value="css">CSS</option>
          <option value="json">JSON</option>
          <option value="bash">Bash</option>
        </select>
        <button
          onClick={handleCopy}
          className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
      <div className="p-4 text-sm font-mono overflow-x-auto relative">
        <Editor
          value={block.content}
          onValueChange={(code: string) => updateBlock(topicId, block.id, { content: code })}
          highlight={(code: string) => highlightWithLineNumbers(code, lang)}
          padding={0}
          onKeyDown={onKeyDown}
          style={{
            fontFamily: '"Fira Code", "JetBrains Mono", monospace',
            fontSize: 14,
            backgroundColor: "transparent",
            outline: "none"
          }}
          textareaClassName="focus:outline-none w-full h-full min-h-[60px]"
        />
      </div>
    </div>
  );
};
