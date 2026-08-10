import { z } from "zod";

export const customerSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name").max(100),
  email: z.string().trim().email("Enter a valid email address").max(255),
  phone: z.string().trim().min(6, "Enter a valid phone number").max(30),
  address: z.string().trim().min(4, "Enter your street address").max(200),
  city: z.string().trim().min(2, "Enter your city").max(100),
  region: z.string().trim().min(1, "Enter your state or region").max(100),
  postalCode: z.string().trim().min(2, "Enter your postal code").max(20),
  country: z.string().trim().min(2, "Enter your country").max(100),
});

export const checkoutSchema = z.object({
  customer: customerSchema,
  items: z
    .array(
      z.object({
        product_id: z.string().trim().min(1).max(140),
        quantity: z.number().int().min(1).max(20),
      }),
    )
    .min(1, "Your cart is empty"),
});

export type CustomerInput = z.infer<typeof customerSchema>;
