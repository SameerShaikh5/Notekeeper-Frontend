import React, { useState } from "react";
import { useNotes } from "../context/NotesContext";
import { useAuth } from "../context/AuthContext";
import { FolderOpen, FileText, Plus, LogOut, ChevronRight } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import toast from "react-hot-toast";

export const Dashboard: React.FC = () => {
  const { subjects, topics, setActiveTopicId, addSubject, addTopic } = useNotes();
  const { logout, user } = useAuth();
  const [newSubjectName, setNewSubjectName] = useState("");
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [addTopicModal, setAddTopicModal] = useState<{ isOpen: boolean; subjectId: string }>({ isOpen: false, subjectId: "" });
  const [newTopicTitle, setNewTopicTitle] = useState("");

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;
    try {
      await addSubject(newSubjectName);
      setNewSubjectName("");
      setIsAddingSubject(false);
      toast.success("Subject created");
    } catch {
      toast.error("Failed to create subject");
    }
  };

  const handleOpenAddTopic = (subjectId: string) => {
    setNewTopicTitle("");
    setAddTopicModal({ isOpen: true, subjectId });
  };

  const handleAddTopicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle.trim()) return;
    try {
      await addTopic(addTopicModal.subjectId, newTopicTitle);
      toast.success("Topic created");
      setAddTopicModal({ isOpen: false, subjectId: "" });
    } catch {
      toast.error("Failed to create topic");
    }
  };

  return (
    <>
      {/* Add Topic Modal */}
      {addTopicModal.isOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-sm rounded-lg shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-border">
              <h3 className="font-semibold text-foreground">Add Topic</h3>
              <button 
                onClick={() => setAddTopicModal({ isOpen: false, subjectId: "" })}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddTopicSubmit} className="p-4">
              <input
                autoFocus
                type="text"
                value={newTopicTitle}
                onChange={(e) => setNewTopicTitle(e.target.value)}
                placeholder="Topic Title"
                className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary text-foreground mb-4"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddTopicModal({ isOpen: false, subjectId: "" })}
                  className="px-4 py-2 text-sm font-medium rounded-md border border-border hover:bg-secondary text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newTopicTitle.trim()}
                  className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    <div className="h-full overflow-y-auto bg-background text-foreground flex flex-col custom-scrollbar">
      <header className="border-b border-border bg-card/50 px-6 py-4 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <FolderOpen className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold leading-tight">NoteKeeper</h1>
            <p className="text-xs text-muted-foreground truncate max-w-[120px] sm:max-w-xs">{user?.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <button
            onClick={logout}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Log out</span>
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h2 className="text-3xl font-bold tracking-tight">Your Subjects</h2>
          {!isAddingSubject ? (
            <button
              onClick={() => setIsAddingSubject(true)}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors font-medium text-sm shadow-sm"
            >
              <Plus className="w-4 h-4" /> New Subject
            </button>
          ) : (
            <form onSubmit={handleAddSubject} className="flex flex-wrap items-center gap-2 animate-in fade-in slide-in-from-right-4">
              <input
                type="text"
                autoFocus
                placeholder="Subject name..."
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
                className="w-full sm:w-48 px-3 py-1.5 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button type="submit" className="px-3 py-1.5 bg-primary text-primary-foreground text-sm rounded-md font-medium">Save</button>
              <button type="button" onClick={() => setIsAddingSubject(false)} className="px-3 py-1.5 bg-secondary text-secondary-foreground text-sm rounded-md">Cancel</button>
            </form>
          )}
        </div>

        {subjects.length === 0 ? (
          <div className="text-center py-20 bg-card/30 border border-border border-dashed rounded-xl">
            <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-1">No subjects yet</h3>
            <p className="text-muted-foreground mb-4">Create your first subject to start organizing your notes.</p>
            <button
              onClick={() => setIsAddingSubject(true)}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors font-medium text-sm"
            >
              <Plus className="w-4 h-4" /> Create Subject
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject) => {
              const subjectTopics = topics.filter((t) => t.subjectId === subject.id).sort((a, b) => a.order - b.order);
              return (
                <div key={subject.id} className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
                  <div className="p-5 border-b border-border/50 bg-secondary/20 flex items-center justify-between">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <FolderOpen className="w-5 h-5 text-primary" />
                      {subject.name}
                    </h3>
                    <span className="text-xs font-medium px-2 py-1 bg-background rounded-full text-muted-foreground border border-border">
                      {subjectTopics.length} notes
                    </span>
                  </div>
                  <div className="p-3 flex-1 flex flex-col gap-1 min-h-[120px]">
                    {subjectTopics.slice(0, 5).map((topic) => (
                      <button
                        key={topic.id}
                        onClick={() => setActiveTopicId(topic.id)}
                        className="flex items-center justify-between w-full p-2 rounded-md hover:bg-secondary text-left group transition-colors"
                      >
                        <span className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-foreground">
                          <FileText className="w-4 h-4 opacity-70" />
                          <span className="truncate">{topic.title}</span>
                        </span>
                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-50 transition-opacity" />
                      </button>
                    ))}
                    {subjectTopics.length > 5 && (
                      <div className="px-2 py-1 text-xs text-muted-foreground italic">
                        + {subjectTopics.length - 5} more...
                      </div>
                    )}
                    {subjectTopics.length === 0 && (
                      <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground italic opacity-70">
                        Empty
                      </div>
                    )}
                  </div>
                  <div className="p-3 bg-secondary/10 border-t border-border/50 mt-auto">
                    <button
                      onClick={() => handleOpenAddTopic(subject.id)}
                      className="w-full py-1.5 flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                    >
                      <Plus className="w-4 h-4" /> Add Note
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
    </>
  );
};
