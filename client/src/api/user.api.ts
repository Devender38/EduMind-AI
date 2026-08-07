import api from "./axios";

export interface UserProfile {
  id: string;
  name: string;
  username?: string;
  email: string;
  role: string;
  avatar?: string;
  bio?: string;
  phone?: string;
  country?: string;
  timezone?: string;
  isVerified?: boolean;
  createdAt?: string;
}

export interface ProfileResponse {
  success: boolean;
  message?: string;
  user: UserProfile;
  avatar?: string;
}

// ===============================
// Get Profile
// ===============================
export const getUserProfile = async (): Promise<UserProfile> => {
  const res = await api.get<{ success: boolean; user: UserProfile }>("/users/profile");
  return res.data.user;
};

// ===============================
// Update Profile
// ===============================
export const updateUserProfile = async (data: {
  name?: string;
  username?: string;
  bio?: string;
  phone?: string;
  country?: string;
  timezone?: string;
  avatar?: string;
}): Promise<ProfileResponse> => {
  const res = await api.put<ProfileResponse>("/users/profile", data);
  return res.data;
};

// ===============================
// Upload Avatar
// ===============================
export const uploadUserAvatar = async (file: File): Promise<ProfileResponse> => {
  const formData = new FormData();
  formData.append("avatar", file);

  const res = await api.post<ProfileResponse>("/users/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

// ===============================
// Remove Avatar
// ===============================
export const removeUserAvatar = async (): Promise<{ success: boolean; message: string; avatar: string }> => {
  const res = await api.delete<{ success: boolean; message: string; avatar: string }>("/users/avatar");
  return res.data;
};

// ===============================
// Update Password
// ===============================
export const updateUserPassword = async (data: {
  currentPassword: string;
  newPassword: string;
  confirmPassword?: string;
}): Promise<{ success: boolean; message: string }> => {
  const res = await api.put<{ success: boolean; message: string }>("/users/password", data);
  return res.data;
};
