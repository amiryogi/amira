import { z } from 'zod';

export const sendMessageSchema = z.object({
  roomId: z.string().min(1, 'Room ID is required'),
  content: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(2000, 'Message cannot exceed 2000 characters')
    .trim(),
  attachments: z
    .array(
      z.object({
        type: z.literal('image'),
        url: z
          .string()
          .url('Invalid attachment URL')
          .refine((url) => url.startsWith('https://'), 'Attachments must use HTTPS'),
      }),
    )
    .max(5, 'Maximum 5 attachments per message')
    .optional()
    .default([]),
});

export const joinChatSchema = z.object({
  roomId: z.string().optional(),
});

export type SendMessageSchemaType = z.infer<typeof sendMessageSchema>;
export type JoinChatSchemaType = z.infer<typeof joinChatSchema>;
