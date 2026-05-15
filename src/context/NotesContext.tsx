import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { api, useAuth } from "./AuthContext";

export type BlockType = "text" | "code" | "heading" | "image";

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  language?: string;
  order: number;
}

export interface Topic {
  id: string;
  subjectId: string;
  title: string;
  order: number;
}

export interface Subject {
  id: string;
  name: string;
}

interface NotesContextType {
  subjects: Subject[];
  topics: Topic[];
  notes: Record<string, Block[]>;
  activeTopicId: string | null;
  setActiveTopicId: (id: string | null) => void;
  addSubject: (name: string) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;
  addTopic: (subjectId: string, title: string) => Promise<void>;
  deleteTopic: (id: string) => Promise<void>;
  updateTopicOrder: (topicId: string, newOrder: number, newSubjectId: string) => Promise<void>;
  reorderTopics: (subjectId: string, startIndex: number, endIndex: number) => Promise<void>;
  addBlock: (topicId: string, type: BlockType, insertIndex?: number) => Promise<void>;
  updateBlock: (topicId: string, blockId: string, updates: Partial<Block>) => Promise<void>;
  deleteBlock: (topicId: string, blockId: string) => Promise<void>;
  fetchBlocks: (topicId: string) => Promise<void>;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

const mapMongoId = (item: any) => ({ ...item, id: item._id });

export const NotesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [notes, setNotes] = useState<Record<string, Block[]>>({});
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchSubjects();
      fetchTopics();
    } else {
      setSubjects([]);
      setTopics([]);
      setNotes({});
      setActiveTopicId(null);
    }
  }, [user]);

  const fetchSubjects = async () => {
    try {
      const { data } = await api.get("/notes/subjects");
      setSubjects(data.map(mapMongoId));
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTopics = async () => {
    try {
      const { data } = await api.get("/notes/topics");
      setTopics(data.map(mapMongoId));
    } catch (error) {
      console.error(error);
    }
  };

  const fetchBlocks = async (topicId: string) => {
    if (notes[topicId]) return; // Already fetched
    try {
      const { data } = await api.get(`/notes/blocks/${topicId}`);
      setNotes((prev) => ({ ...prev, [topicId]: data.map(mapMongoId) }));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (activeTopicId) {
      fetchBlocks(activeTopicId);
    }
  }, [activeTopicId]);

  const addSubject = async (name: string) => {
    try {
      const { data } = await api.post("/notes/subjects", { name });
      setSubjects((prev) => [...prev, mapMongoId(data)]);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const deleteSubject = async (id: string) => {
    try {
      await api.delete(`/notes/subjects/${id}`);
      setSubjects((prev) => prev.filter((s) => s.id !== id));
      setTopics((prev) => prev.filter((t) => t.subjectId !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const addTopic = async (subjectId: string, title: string) => {
    try {
      const subjectTopics = topics.filter((t) => t.subjectId === subjectId);
      const { data } = await api.post("/notes/topics", { subjectId, title, order: subjectTopics.length });
      const newTopic = mapMongoId(data);
      setTopics((prev) => [...prev, newTopic]);
      setActiveTopicId(newTopic.id);
      // fetch blocks will be triggered by activeTopicId change
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const deleteTopic = async (id: string) => {
    try {
      await api.delete(`/notes/topics/${id}`);
      setTopics((prev) => prev.filter((t) => t.id !== id));
      if (activeTopicId === id) setActiveTopicId(null);
    } catch (error) {
      console.error(error);
    }
  };

  const updateTopicOrder = async (topicId: string, newOrder: number, newSubjectId: string) => {
    // optimistic
    setTopics((prev) =>
      prev.map((t) => (t.id === topicId ? { ...t, order: newOrder, subjectId: newSubjectId } : t))
    );
    // backend update
    try {
      await api.put(`/notes/topics/reorder`, { updates: [{ id: topicId, order: newOrder }] });
    } catch (error) {
      console.error(error);
    }
  };

  const reorderTopics = async (subjectId: string, startIndex: number, endIndex: number) => {
    let updates: any[] = [];
    setTopics((prev) => {
      const result = Array.from(prev);
      const subjectTopics = result.filter(t => t.subjectId === subjectId).sort((a, b) => a.order - b.order);
      const [removed] = subjectTopics.splice(startIndex, 1);
      subjectTopics.splice(endIndex, 0, removed);
      
      const newTopics = result.map(t => {
        if (t.subjectId === subjectId) {
          const newOrder = subjectTopics.findIndex(ct => ct.id === t.id);
          if (t.order !== newOrder) updates.push({ id: t.id, order: newOrder });
          return { ...t, order: newOrder };
        }
        return t;
      });
      return newTopics;
    });

    if (updates.length > 0) {
      try {
        await api.put(`/notes/topics/reorder`, { updates });
      } catch (error) {
        console.error(error);
      }
    }
  };

  const addBlock = async (topicId: string, type: BlockType, insertIndex?: number) => {
    const topicBlocks = notes[topicId] || [];
    const index = insertIndex !== undefined ? insertIndex : topicBlocks.length;
    
    // optimistic temp block
    const tempId = `temp-${Date.now()}`;
    const newBlock: Block = { id: tempId, type, content: "", language: type === "code" ? "javascript" : undefined, order: index };
    
    setNotes((prev) => {
      const newBlocks = [...(prev[topicId] || [])];
      newBlocks.splice(index, 0, newBlock);
      return { ...prev, [topicId]: newBlocks };
    });

    try {
      const { data } = await api.post("/notes/blocks", { topicId, type, content: "", language: newBlock.language, order: index });
      // replace temp with real block
      setNotes((prev) => {
        const newBlocks = [...(prev[topicId] || [])];
        const idx = newBlocks.findIndex(b => b.id === tempId);
        if (idx !== -1) newBlocks[idx] = mapMongoId(data);
        return { ...prev, [topicId]: newBlocks };
      });
    } catch (error) {
      console.error(error);
      // rollback
      setNotes((prev) => ({ ...prev, [topicId]: prev[topicId].filter(b => b.id !== tempId) }));
    }
  };

  const updateBlock = async (topicId: string, blockId: string, updates: Partial<Block>) => {
    // optimistic
    setNotes((prev) => {
      const topicBlocks = prev[topicId] || [];
      const newBlocks = topicBlocks.map((b) => (b.id === blockId ? { ...b, ...updates } : b));
      return { ...prev, [topicId]: newBlocks };
    });

    if (blockId.startsWith("temp-")) return; // skip backend call for temp block

    try {
      await api.put(`/notes/blocks/${blockId}`, updates);
    } catch (error) {
      console.error(error);
    }
  };

  const deleteBlock = async (topicId: string, blockId: string) => {
    // optimistic
    setNotes((prev) => {
      const topicBlocks = prev[topicId] || [];
      const newBlocks = topicBlocks.filter((b) => b.id !== blockId);
      return { ...prev, [topicId]: newBlocks };
    });

    if (blockId.startsWith("temp-")) return;

    try {
      await api.delete(`/notes/blocks/${blockId}`);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <NotesContext.Provider
      value={{
        subjects,
        topics,
        notes,
        activeTopicId,
        setActiveTopicId,
        addSubject,
        deleteSubject,
        addTopic,
        deleteTopic,
        updateTopicOrder,
        reorderTopics,
        addBlock,
        updateBlock,
        deleteBlock,
        fetchBlocks,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
};

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error("useNotes must be used within a NotesProvider");
  }
  return context;
};
