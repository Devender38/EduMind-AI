import api from "./axios";

export const uploadPDF = async (file: File) => {
  const token = localStorage.getItem("token");

  const form = new FormData();

  form.append("pdf", file);

  const res = await api.post(
    "/documents/upload",
    form,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return res.data;
};