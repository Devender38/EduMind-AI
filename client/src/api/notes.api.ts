import api from "./axios";

export interface NoteItem {
  _id: string;
  userId: string;
  documentId?: {
    _id: string;
    title: string;
    fileUrl?: string;
  };
  title: string;
  noteType: "detailed" | "exam" | "revision" | "one_page" | "bullet";
  content: string;
  tags: string[];
  isBookmarked: boolean;
  createdAt: string;
  updatedAt: string;
}

export const generateNotes = async (
  documentId: string,
  noteType: "detailed" | "exam" | "revision" | "one_page" | "bullet" = "detailed",
  title?: string
): Promise<NoteItem> => {
  const res = await api.post("/notes/generate", {
    documentId,
    noteType,
    title,
  });
  return res.data.note;
};

export const getNotes = async (
  documentId?: string,
  noteType?: string
): Promise<NoteItem[]> => {
  const res = await api.get("/notes", {
    params: { documentId, noteType },
  });
  return res.data.notes;
};

export const getNoteById = async (id: string): Promise<NoteItem> => {
  const res = await api.get(`/notes/${id}`);
  return res.data.note;
};

export const updateNote = async (
  id: string,
  updates: Partial<NoteItem>
): Promise<NoteItem> => {
  const res = await api.put(`/notes/${id}`, updates);
  return res.data.note;
};

export const deleteNote = async (id: string): Promise<void> => {
  await api.delete(`/notes/${id}`);
};
