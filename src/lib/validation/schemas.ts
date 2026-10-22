import { z } from "zod";

import {
  MAX_CONTENT_BYTES,
  MAX_DESCRIPTION_LENGTH,
  MAX_FILE_NAME_LENGTH,
  MAX_TITLE_LENGTH,
  utf8ByteLength,
} from "@/lib/validation/document";

const titleSchema = z
  .string()
  .trim()
  .min(1, "Add a title for this document.")
  .max(MAX_TITLE_LENGTH, `Titles can be at most ${MAX_TITLE_LENGTH} characters.`);

const descriptionSchema = z
  .string()
  .trim()
  .max(
    MAX_DESCRIPTION_LENGTH,
    `Descriptions can be at most ${MAX_DESCRIPTION_LENGTH} characters.`,
  )
  .optional()
  .default("");

const contentSchema = z
  .string()
  .min(1, "The document content cannot be empty.")
  .refine((value) => value.trim().length > 0, "The document content cannot be empty.")
  .refine(
    (value) => utf8ByteLength(value) <= MAX_CONTENT_BYTES,
    "The document content must be 2 MB or smaller.",
  );

export const documentIdSchema = z.uuid("That document ID is not valid.");

export const createDocumentInputSchema = z.object({
  title: titleSchema,
  description: descriptionSchema,
  content: contentSchema,
  originalFileName: z.string().max(MAX_FILE_NAME_LENGTH).optional(),
});

export const updateDocumentMetadataSchema = z.object({
  documentId: documentIdSchema,
  title: titleSchema,
  description: descriptionSchema,
});

export const updateDocumentContentSchema = z.object({
  documentId: documentIdSchema,
  content: contentSchema,
});

export const documentSlugSchema = z
  .string()
  .min(3)
  .max(120)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Slugs may only contain lowercase letters, numbers, and dashes.",
  );

export type CreateDocumentInput = z.infer<typeof createDocumentInputSchema>;
export type UpdateDocumentMetadataInput = z.infer<typeof updateDocumentMetadataSchema>;
export type UpdateDocumentContentInput = z.infer<typeof updateDocumentContentSchema>;

export const emailSchema = z
  .email("Enter a valid email address.")
  .trim()
  .max(254, "Enter a shorter email address.");

export const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters.")
  .max(72, "Use at most 72 characters.");

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password."),
});

export const signUpSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your password."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
