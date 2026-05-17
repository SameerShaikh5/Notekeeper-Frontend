import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { TipTapEditor } from "./Editor/TipTapEditor";
import { Menu } from "lucide-react";
import { useNotes } from "../context/NotesContext";

export const EditorLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { activeTopicId } = useNotes();

  if (!activeTopicId) return null;

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden relative">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden p-4 border-b border-border flex items-center bg-card">
          <button onClick={() => setIsSidebarOpen(true)} className="text-muted-foreground hover:text-foreground">
            <Menu className="w-6 h-6" />
          </button>
        </div>
        
        {/* Editor Area */}
        <div className="flex-1 overflow-y-auto">
          <TipTapEditor topicId={activeTopicId} />
        </div>
      </div>
    </div>
  );
};
