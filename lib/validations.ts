import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const bookingSchema = z.object({
  listingId: z.string().min(1, "Please select an accommodation"),
  checkInDate: z.string().min(1, "Please select a check-in date"),
  duration: z.enum(["DAILY", "WEEKLY", "MONTHLY"]),
  durationCount: z.number().min(1, "Duration must be at least 1"),
  residentName: z.string().min(2, "Please enter the resident's name"),
  residentPhone: z.string().min(7, "Please enter a valid phone number"),
  residentAddress: z.string().optional(),
  emergencyContact: z.string().min(7, "Please enter an emergency contact number"),
  emergencyRel: z.string().min(2, "Please specify relationship"),
  notes: z.string().optional(),
});

export const listingSchema = z.object({
  houseId: z.string().min(1, "Please select a house"),
  title: z.string().min(2, "Title is required"),
  type: z.enum(["BED_SPACE", "SINGLE_ROOM", "APARTMENT"]),
  price: z.number().min(0, "Price must be positive"),
  capacity: z.number().min(1, "Capacity must be at least 1"),
  description: z.string().optional(),
  amenities: z.array(z.string()).optional(),
  isFeatured: z.boolean().optional(),
  isPublished: z.boolean().optional(),
});

export const houseSchema = z.object({
  name: z.string().min(2, "Name is required"),
  location: z.string().min(2, "Location is required"),
  address: z.string().optional(),
  description: z.string().optional(),
});

export const residentSchema = z.object({
  customerProfileId: z.string().min(1),
  bookingId: z.string().optional(),
  listingId: z.string().min(1, "Please select a listing"),
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(7, "Phone is required"),
  address: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  emergencyContact: z.string().min(7, "Emergency contact is required"),
  emergencyRel: z.string().min(2, "Relationship is required"),
  checkInDate: z.string().min(1, "Check-in date is required"),
  duration: z.enum(["DAILY", "WEEKLY", "MONTHLY"]),
  durationCount: z.number().min(1),
});

export const testimonialSchema = z.object({
  authorName: z.string().min(2, "Author name is required"),
  role: z.string().optional(),
  content: z.string().min(10, "Content must be at least 10 characters"),
  rating: z.number().min(1).max(5),
  isActive: z.boolean().optional(),
});

export const settingSchema = z.object({
  key: z.string().min(1),
  value: z.string(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
export type ListingInput = z.infer<typeof listingSchema>;
export type HouseInput = z.infer<typeof houseSchema>;
export type ResidentInput = z.infer<typeof residentSchema>;
export type TestimonialInput = z.infer<typeof testimonialSchema>;
