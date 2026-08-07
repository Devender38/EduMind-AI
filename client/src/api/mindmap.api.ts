import api from "./axios";

export interface MindMapNode {
  id: string;
  label: string;
  color?: string;
  children?: MindMapNode[];
}

export const generateMindMap = async (
  documentId: string
): Promise<MindMapNode> => {
  const res = await api.post("/mindmap/generate", { documentId });
  return res.data.mindmap;
};
