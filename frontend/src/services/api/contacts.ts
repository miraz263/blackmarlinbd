import { apiClient } from "./client";
import type { ContactFormData } from "@/types";

export const contactsApi = {
  submit: (data: ContactFormData) => apiClient.post("/contacts/", data),
};
