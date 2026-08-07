import api from "./axios";

export interface DocumentItem {
  _id: string;
  title: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  status: string;
  createdAt: string;
  summary?: string;
  pageCount?: number;
  chunkCount?: number;
  readingTime?: number;
  keywords?: string[];
}

export interface UploadResponse {
  success: boolean;
  document: DocumentItem;
}

interface DocumentsResponse {
  success: boolean;
  documents: DocumentItem[];
}

// ===============================
// Upload Document
// ===============================

export const uploadDocument = async (
  file: File
): Promise<DocumentItem> => {
  const formData = new FormData();

  // IMPORTANT
  formData.append("pdf", file);

  const res = await api.post(
    "/documents/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return res.data.document;
};

// ===============================
// Get Documents
// ===============================

export const getDocuments =
  async (): Promise<DocumentItem[]> => {
    const res =
      await api.get<DocumentsResponse>(
        "/documents"
      );

    return res.data.documents;
  };

// ===============================
// Delete Document
// ===============================

export const deleteDocument =
  async (
    id: string
  ): Promise<void> => {
    await api.delete(
      `/documents/${id}`
    );
  };

// ===============================
// Get Single Document
// ===============================

export const getDocument =
  async (
    id: string
  ): Promise<DocumentItem> => {
    const res =
      await api.get<{
        success: boolean;
        document: DocumentItem;
      }>(`/documents/${id}`);

    return res.data.document;
  };