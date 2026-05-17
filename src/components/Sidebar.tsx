import React, { useState, useEffect, useRef } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import { useNotes } from "../context/NotesContext";
import { useAuth } from "../context/AuthContext";
import { X, ChevronDown, ChevronRight, Plus, Search, FileText, FolderOpen } from "lucide-react";
import { cn } from "../lib/utils";
import toast from "react-hot-toast";

import { ThemeToggle } from "./ThemeToggle";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { subjects, topics, activeTopicId, setActiveTopicId, addSubject, addTopic, reorderTopics } = useNotes();
  const { logout } = useAuth();
  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>(
    subjects.reduce((acc, sub) => ({ ...acc, [sub.id]: true }), {})
  );
  const [searchQuery, setSearchQuery] = useState("");

  const [modalConfig, setModalConfig] = useState<{isOpen: boolean, type: 'subject' | 'topic', subjectId?: string}>({isOpen: false, type: 'subject'});
  const [modalInput, setModalInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (modalConfig.isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [modalConfig.isOpen]);

  const toggleSubject = (id: string) => {
    setExpandedSubjects((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination } = result;

    if (source.droppableId === destination.droppableId) {
      reorderTopics(source.droppableId, source.index, destination.index);
    }
  };

  const openAddSubjectModal = () => {
    setModalInput("");
    setModalConfig({ isOpen: true, type: 'subject' });
  };

  const openAddTopicModal = (subjectId: string) => {
    setModalInput("");
    setModalConfig({ isOpen: true, type: 'topic', subjectId });
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalInput.trim()) return;

    try {
      if (modalConfig.type === 'subject') {
        await addSubject(modalInput);
        toast.success("Subject added!");
      } else if (modalConfig.type === 'topic' && modalConfig.subjectId) {
        await addTopic(modalConfig.subjectId, modalInput);
        toast.success("Topic added!");
      }
      setModalConfig({ ...modalConfig, isOpen: false });
      setModalInput("");
    } catch (error) {
      toast.error("Failed to add item");
    }
  };

  const handleTopicClick = (topicId: string) => {
    setActiveTopicId(topicId);
    // Close sidebar on mobile when a topic is selected
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Modal */}
      {modalConfig.isOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-sm rounded-lg shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-border">
              <h3 className="font-semibold text-foreground">
                {modalConfig.type === 'subject' ? 'Add Subject' : 'Add Topic'}
              </h3>
              <button 
                onClick={() => setModalConfig({...modalConfig, isOpen: false})}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleModalSubmit} className="p-4">
              <input
                ref={inputRef}
                type="text"
                value={modalInput}
                onChange={(e) => setModalInput(e.target.value)}
                placeholder={modalConfig.type === 'subject' ? "Subject Name" : "Topic Title"}
                className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary text-foreground mb-4"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalConfig({...modalConfig, isOpen: false})}
                  className="px-4 py-2 text-sm font-medium rounded-md border border-border hover:bg-secondary text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!modalInput.trim()}
                  className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sidebar Content */}
      <div className={cn(
        "fixed md:static inset-y-0 left-0 z-50 w-64 bg-secondary/30 border-r border-border h-screen flex flex-col transform transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-primary" /> NoteKeeper
          </h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button onClick={onClose} className="md:hidden text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background border border-border rounded-md pl-9 pr-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <DragDropContext onDragEnd={handleDragEnd}>
          {subjects
            .filter((subject) => {
              // Only show the subject that contains the currently active topic
              if (!activeTopicId) return true;
              const activeSubjectId = topics.find(t => t.id === activeTopicId)?.subjectId;
              return subject.id === activeSubjectId;
            })
            .map((subject) => {
            const subjectTopics = topics
              .filter((t) => t.subjectId === subject.id)
              .filter((t) => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
              .sort((a, b) => a.order - b.order);

            const isExpanded = expandedSubjects[subject.id];

            return (
              <div key={subject.id} className="mb-2">
                <div 
                  className="flex items-center justify-between p-2 rounded-md md:hover:bg-secondary/50 cursor-pointer group transition-colors"
                  onClick={() => toggleSubject(subject.id)}
                >
                  <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    {subject.name} <span className="text-xs font-normal opacity-70">({subjectTopics.length})</span>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); openAddTopicModal(subject.id); }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-primary transition-opacity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {isExpanded && (
                  <Droppable droppableId={subject.id}>
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="pl-4 mt-1 space-y-0.5"
                      >
                        {subjectTopics.map((topic, index) => (
                          <Draggable key={topic.id} draggableId={topic.id} index={index}>
                            {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  onClick={() => handleTopicClick(topic.id)}
                                  className={cn(
                                    "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm cursor-pointer transition-colors active:scale-[0.98]",
                                    activeTopicId === topic.id 
                                      ? "bg-primary/10 text-primary font-medium" 
                                      : "text-muted-foreground md:hover:bg-secondary hover:text-foreground",
                                    snapshot.isDragging && "bg-secondary shadow-lg z-50 ring-1 ring-border"
                                  )}
                                >
                                <FileText className="w-3.5 h-3.5" />
                                <span className="truncate">{topic.title}</span>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                )}
              </div>
            );
          })}
        </DragDropContext>
      </div>

      <div className="p-4 border-t border-border">
        <button 
          onClick={openAddSubjectModal}
          className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md border border-border border-dashed hover:border-primary hover:text-primary transition-colors text-muted-foreground mb-2"
        >
          <Plus className="w-4 h-4" /> Add Subject
        </button>
        <button 
          onClick={logout}
          className="w-full flex items-center justify-center py-2 text-sm font-medium rounded-md border border-border bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
    </>
  );
};
