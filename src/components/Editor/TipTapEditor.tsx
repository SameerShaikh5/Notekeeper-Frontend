import React, { useEffect, useState } from "react";
import { useEditor, EditorContent, ReactNodeViewRenderer } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import { useNotes } from "../../context/NotesContext";
import { ChevronRight, Trash2 } from "lucide-react";
import { CodeBlockComponent } from "./CodeBlockComponent";

const lowlight = createLowlight(common);

interface TipTapEditorProps {
  topicId: string;
}

export const TipTapEditor: React.FC<TipTapEditorProps> = ({ topicId }) => {
  const { topics, subjects, updateTopic, deleteTopic, setActiveTopicId } = useNotes();
  const topic = topics.find((t) => t.id === topicId);
  const subject = subjects.find((s) => s.id === topic?.subjectId);
  
  const [title, setTitle] = useState(topic?.title || "");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // disable default codeBlock in favor of lowlight
      }),
      Placeholder.configure({
        placeholder: "Type '/' for commands or just start typing...",
        emptyEditorClass: "is-editor-empty",
      }),
      CodeBlockLowlight.extend({
        addNodeView() {
          return ReactNodeViewRenderer(CodeBlockComponent);
        },
      }).configure({
        lowlight,
      }),
    ],
    content: topic?.content || "",
    onUpdate: ({ editor }) => {
      // save content
      updateTopic(topicId, { content: editor.getHTML() });
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose-base dark:prose-invert max-w-none focus:outline-none min-h-[500px] pb-32",
      },
    },
  }, [topicId]);

  useEffect(() => {
    if (topic && topic.title !== title) {
      setTitle(topic.title);
    }
  }, [topic]);

  const handleTitleBlur = () => {
    if (title.trim() && title !== topic?.title) {
      updateTopic(topicId, { title: title.trim() });
    }
  };

  const handleDelete = async () => {
    await deleteTopic(topicId);
  };

  if (!topic) return null;

  return (
    <>
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-sm rounded-lg shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-2">Delete Note?</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Are you sure you want to delete "{topic.title}"? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium rounded-md border border-border hover:bg-secondary text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 text-sm font-medium rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    <div className="flex-1 flex flex-col h-full bg-background overflow-y-auto custom-scrollbar">
      <div className="max-w-4xl w-full mx-auto p-6 md:p-12">
        {/* Breadcrumb & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 group">
          <div className="flex items-center flex-wrap gap-2 text-sm font-medium text-muted-foreground">
            <button onClick={() => setActiveTopicId(null)} className="hover:text-foreground transition-colors">
              Dashboard
            </button>
            <ChevronRight className="w-4 h-4 opacity-50" />
            <span>{subject?.name}</span>
            <ChevronRight className="w-4 h-4 opacity-50" />
            <span className="text-foreground">{topic.title}</span>
          </div>
          
          <button 
            onClick={() => setIsDeleteModalOpen(true)}
            className="text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1 text-sm bg-destructive/10 px-3 py-1.5 rounded-md"
          >
            <Trash2 className="w-4 h-4" /> Delete Note
          </button>
        </div>

        {/* Title Input */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleTitleBlur}
          placeholder="Note Title"
          className="text-4xl md:text-5xl font-bold bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/50 w-full mb-8 font-sans tracking-tight"
        />

        {/* Rich Text Editor */}
        <div className="editor-wrapper text-lg">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
    </>
  );
};
