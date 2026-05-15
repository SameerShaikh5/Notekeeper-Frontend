import React from "react";
import { useNotes } from "../../context/NotesContext";
import type { BlockType } from "../../context/NotesContext";
import { TextBlock } from "./TextBlock";
import { CodeBlock } from "./CodeBlock";
import { HeadingBlock } from "./HeadingBlock";
import { Menu, Plus, ChevronRight } from "lucide-react";

interface BlockEditorProps {
  onOpenSidebar: () => void;
}

export const BlockEditor: React.FC<BlockEditorProps> = ({ onOpenSidebar }) => {
  const { subjects, topics, notes, activeTopicId, addBlock, updateBlock, deleteBlock } = useNotes();

  if (!activeTopicId) {
    return (
      <div className="flex-1 flex flex-col bg-background">
        <div className="p-4 md:hidden border-b border-border">
          <button onClick={onOpenSidebar} className="text-muted-foreground hover:text-foreground">
            <Menu className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <p className="mb-2">No topic selected</p>
            <p className="text-sm">Select a topic from the sidebar or create a new one.</p>
          </div>
        </div>
      </div>
    );
  }

  const topic = topics.find((t) => t.id === activeTopicId);
  const subject = subjects.find((s) => s.id === topic?.subjectId);
  const blocks = notes[activeTopicId] || [];

  const handleKeyDown = (e: React.KeyboardEvent, index: number, blockId: string) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      addBlock(activeTopicId, "text", index + 1);
    }
    if (e.key === "Backspace" && blocks[index].content === "") {
      e.preventDefault();
      if (blocks.length > 1) {
        deleteBlock(activeTopicId, blockId);
      }
    }
  };

  const renderBlock = (block: any, index: number) => {
    const commonProps = {
      block,
      topicId: activeTopicId,
      updateBlock,
      onKeyDown: (e: React.KeyboardEvent) => handleKeyDown(e, index, block.id),
      autoFocus: index === blocks.length - 1, // Autofocus new blocks
    };

    switch (block.type) {
      case "text":
        return <TextBlock key={block.id} {...commonProps} />;
      case "code":
        return <CodeBlock key={block.id} {...commonProps} />;
      case "heading":
        return <HeadingBlock key={block.id} {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-y-auto bg-background">
      <div className="p-4 md:hidden border-b border-border sticky top-0 z-10 bg-background/80 backdrop-blur-sm">
        <button onClick={onOpenSidebar} className="text-muted-foreground hover:text-foreground">
          <Menu className="w-6 h-6" />
        </button>
      </div>
      <div className="max-w-3xl w-full mx-auto p-6 md:p-10 pt-6 md:pt-20">
        
        {/* Breadcrumb */}
        {subject && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4 font-medium">
            <span>{subject.name}</span>
            <ChevronRight className="w-4 h-4 opacity-50" />
            <span className="text-foreground">{topic?.title}</span>
          </div>
        )}

        <h1 className="text-4xl font-bold mb-8 text-foreground outline-none" contentEditable suppressContentEditableWarning>
          {topic?.title}
        </h1>
        
        <div className="space-y-4">
          {blocks.map((block, index) => (
            <div key={block.id} className="relative group">
              <div className="absolute -left-12 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex gap-1 bg-secondary rounded-md shadow-sm border border-border p-1">
                  <button onClick={() => addBlock(activeTopicId, "text", index + 1)} className="p-1 hover:text-primary"><Plus className="w-4 h-4" /></button>
                  <select 
                    defaultValue=""
                    className="bg-transparent text-xs outline-none cursor-pointer p-1"
                    onChange={(e) => {
                      if (e.target.value) {
                        addBlock(activeTopicId, e.target.value as BlockType, index + 1);
                        e.target.value = "";
                      }
                    }}
                  >
                    <option value="" disabled>Add</option>
                    <option value="text">Text</option>
                    <option value="heading">Heading</option>
                    <option value="code">Code</option>
                  </select>
                </div>
              </div>
              {renderBlock(block, index)}
            </div>
          ))}
          {blocks.length === 0 && (
             <div 
               className="text-muted-foreground cursor-text py-2" 
               onClick={() => addBlock(activeTopicId, "text")}
             >
               Click to start writing...
             </div>
          )}
        </div>
      </div>
    </div>
  );
};
