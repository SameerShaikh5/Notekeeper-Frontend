import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { api, useAuth } from "./AuthContext";

export interface Topic {
  id: string;
  subjectId: string;
  title: string;
  content: string; // Tiptap JSON or HTML string
  order: number;
}

export interface Subject {
  id: string;
  name: string;
}

interface NotesContextType {
  subjects: Subject[];
  topics: Topic[];
  activeTopicId: string | null;
  setActiveTopicId: (id: string | null) => void;
  addSubject: (name: string) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;
  addTopic: (subjectId: string, title: string) => Promise<void>;
  updateTopic: (topicId: string, updates: Partial<Topic>) => Promise<void>;
  deleteTopic: (id: string) => Promise<void>;
  updateTopicOrder: (topicId: string, newOrder: number, newSubjectId: string) => Promise<void>;
  reorderTopics: (subjectId: string, startIndex: number, endIndex: number) => Promise<void>;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

const mapMongoId = (item: any) => ({ ...item, id: item._id });

export const NotesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchSubjects();
      fetchTopics();
    } else {
      setSubjects([]);
      setTopics([]);
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
      if (activeTopicId && topics.find(t => t.id === activeTopicId)?.subjectId === id) {
        setActiveTopicId(null);
      }
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
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const updateTopic = async (topicId: string, updates: Partial<Topic>) => {
    // optimistic update
    setTopics((prev) => prev.map((t) => (t.id === topicId ? { ...t, ...updates } : t)));
    try {
      await api.put(`/notes/topics/${topicId}`, updates);
    } catch (error) {
      console.error("Error updating topic", error);
      // rollback could be added here
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

  return (
    <NotesContext.Provider
      value={{
        subjects,
        topics,
        activeTopicId,
        setActiveTopicId,
        addSubject,
        deleteSubject,
        addTopic,
        updateTopic,
        deleteTopic,
        updateTopicOrder,
        reorderTopics,
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
