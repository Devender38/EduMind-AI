import api from "./axios";

export interface BookmarkItem {
  _id: string;
  userId: string;
  documentId?: {
    _id: string;
    title: string;
    fileUrl?: string;
  };
  type: "page" | "answer" | "note" | "flashcard" | "question";
  title: string;
  content: string;
  pageNumber?: number;
  metadata?: Record<string, any>;
  createdAt: string;
}

export const createBookmark = async (data: {
  documentId?: string;
  type: "page" | "answer" | "note" | "flashcard" | "question";
  title: string;
  content: string;
  pageNumber?: number;
  metadata?: Record<string, any>;
}): Promise<BookmarkItem> => {
  const res = await api.post("/bookmarks", data);
  return res.data.bookmark;
};

export const getBookmarks = async (
  type?: string,
  documentId?: string
): Promise<BookmarkItem[]> => {
  const res = await api.get("/bookmarks", {
    params: { type, documentId },
  });
  return res.data.bookmarks;
};

export const deleteBookmark = async (id: string): Promise<void> => {
  await api.delete(`/bookmarks/${id}`);
};
