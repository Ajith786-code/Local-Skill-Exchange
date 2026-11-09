const { z } = require('zod');
const { CATEGORIES, LEVELS, LEARNING_MODES, REQUEST_STATUSES, MAX_MESSAGE_LENGTH } = require('../utils/constants');

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');
const email = z.string().trim().toLowerCase().email('Please enter a valid email address').max(120);
const password = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must be at most 72 characters')
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/\d/, 'Password must contain a number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain a special character');

const personName = z.string().trim().min(2, 'Name must be at least 2 characters').max(60);
const city = z.string().trim().min(2, 'City must be at least 2 characters').max(60);

const skillName = z
  .string()
  .trim()
  .min(1, 'Skill name is required')
  .max(50, 'Skill name must be at most 50 characters')
  .regex(/^[\p{L}\p{N} .,+#&'’\-/()]+$/u, 'Skill name contains unsupported characters');

const skillInput = z.object({
  name: skillName,
  category: z.enum(CATEGORIES).optional(),
  level: z.enum(LEVELS).optional(),
});

const page = z.coerce.number().int().min(1).max(100000).default(1);
const limit = (max, def) => z.coerce.number().int().min(1).max(max).default(def);

const registerSchema = z.object({ name: personName, email, password, city });
const loginSchema = z.object({ email, password: z.string().min(1, 'Password is required').max(200) });

const updateProfileSchema = z.object({
  name: personName.optional(),
  city: city.optional(),
  bio: z.string().trim().max(500, 'Bio must be at most 500 characters').optional(),
  avatar: z
    .union([
      z.literal(''),
      z
        .string()
        .trim()
        .url('Avatar must be a valid URL')
        .max(500)
        .refine((v) => /^https?:\/\//i.test(v), 'Avatar must start with http:// or https://'),
    ])
    .optional(),
  learningMode: z.enum(LEARNING_MODES).optional(),
  availability: z.string().trim().max(200, 'Availability must be at most 200 characters').optional(),
  offeredSkills: z.array(skillInput).max(20).optional(),
  wantedSkills: z.array(skillInput).max(20).optional(),
});

const deleteAccountSchema = z.object({ password: z.string().min(1, 'Password is required').max(200) });

const discoverQuerySchema = z.object({
  q: z.string().trim().max(60).optional(),
  city: z.string().trim().max(60).optional(),
  category: z.enum(CATEGORIES).optional(),
  mode: z.enum(LEARNING_MODES).optional(),
  level: z.enum(LEVELS).optional(),
  offers: z.string().trim().max(50).optional(),
  wants: z.string().trim().max(50).optional(),
  sort: z.enum(['relevance', 'recent']).default('relevance'),
  page,
  limit: limit(30, 12),
});

const skillListQuerySchema = z.object({
  q: z.string().trim().max(50).optional(),
  category: z.enum(CATEGORIES).optional(),
  limit: limit(100, 50),
});

const createSkillSchema = z.object({ name: skillName, category: z.enum(CATEGORIES).optional() });

const paginationQuerySchema = z.object({ page, limit: limit(30, 10) });

const createRequestSchema = z.object({
  receiverId: objectId,
  offeredSkill: skillName,
  requestedSkill: skillName,
  message: z.string().trim().max(500, 'Message must be at most 500 characters').optional(),
});

const listRequestsQuerySchema = z.object({
  box: z.enum(['incoming', 'outgoing', 'all']).default('all'),
  status: z.enum(REQUEST_STATUSES).optional(),
  page,
  limit: limit(30, 10),
});

const messageTextSchema = z.object({
  text: z
    .string({ required_error: 'Message text is required', invalid_type_error: 'Message text must be text' })
    .trim()
    .min(1, 'Message cannot be empty')
    .max(MAX_MESSAGE_LENGTH, `Message must be at most ${MAX_MESSAGE_LENGTH} characters`),
});

const messageHistoryQuerySchema = z.object({
  before: objectId.optional(),
  limit: limit(50, 30),
});

const notificationListQuerySchema = z.object({
  page,
  limit: limit(50, 15),
  unread: z.enum(['true', 'false']).optional(),
});

module.exports = {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  deleteAccountSchema,
  discoverQuerySchema,
  skillListQuerySchema,
  createSkillSchema,
  paginationQuerySchema,
  createRequestSchema,
  listRequestsQuerySchema,
  messageTextSchema,
  messageHistoryQuerySchema,
  notificationListQuerySchema,
};
