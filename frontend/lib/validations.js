import { z } from 'zod';

export const memberSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  mobile: z.string().min(10, 'Valid mobile number required'),
  email: z.string().email('Invalid email address'),
  city: z.string().min(2, 'City required'),
  address: z.string().min(5, 'Address required'),
  occupation: z.string().optional(),
  volunteer: z.string().optional(),
  status: z.enum(['Approved', 'Pending', 'Rejected']).optional(),
});

export const contactSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email address required'),
  phone: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(5, 'Message must be at least 5 characters'),
});

export const donationSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  amount: z.number().min(1, 'Amount must be greater than 0'),
  transactionId: z.string().min(3, 'Transaction ID is required'),
  paymentStatus: z.enum(['Success', 'Pending', 'Failed']).optional(),
  notes: z.string().optional(),
});

export const eventSchema = z.object({
  title: z.string().min(2, 'Title required'),
  description: z.string().min(5, 'Description required'),
  date: z.string(),
  time: z.string().optional(),
  location: z.string().optional(),
  bannerUrl: z.string().optional(),
  images: z.array(z.string()).optional(),
  order: z.number().optional(),
  active: z.boolean().optional(),
});

export const gallerySchema = z.object({
  title: z.string().optional(),
  category: z.string().optional(),
  imageUrl: z.string().url('Valid image URL required'),
  publicId: z.string().optional(),
  order: z.number().optional(),
});

export const videoSchema = z.object({
  title: z.string().min(2, 'Title required'),
  videoUrl: z.string().url('Valid URL required'),
  videoType: z.enum(['youtube', 'instagram', 'upload']),
  thumbnailUrl: z.string().optional(),
  category: z.string().optional(),
  order: z.number().optional(),
});

export const instagramSchema = z.object({
  title: z.string().optional(),
  postUrl: z.string().url('Valid Instagram link required'),
  type: z.enum(['post', 'reel', 'story']).optional(),
  mediaUrl: z.string().optional(),
  likes: z.string().optional(),
  comments: z.string().optional(),
});

export const announcementSchema = z.object({
  title: z.string().min(2, 'Title required'),
  content: z.string().min(3, 'Content required'),
  type: z.enum(['news', 'notification', 'ticker', 'popup']),
  active: z.boolean().optional(),
  link: z.string().optional(),
});

export const adminLoginSchema = z.object({
  email: z.string().email('Valid email address required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
