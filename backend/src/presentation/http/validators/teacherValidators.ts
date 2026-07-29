import { z } from "zod";

const validatePastDate = (val: string) => {
  const date = new Date(val);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
};

export const createTeacherSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "First name is required")
    .max(50, "First name must be at most 50 characters")
    .regex(/^[A-Za-z]+$/, "First name must contain letters only"),
  lastName: z
    .string()
    .trim()
    .min(1, "Last name is required")
    .max(50, "Last name must be at most 50 characters")
    .regex(/^[A-Za-z]+$/, "Last name must contain letters only"),
  employeeId: z
    .string()
    .trim()
    .min(1, "Employee ID is required")
    .max(50)
    .regex(/^EMP\d{3}$/, "Employee ID must be in the format EMP001"),
  joiningDate: z.string().trim().min(1, "Joining date is required"),
  qualifications: z
    .string()
    .trim()
    .min(1, "Qualifications are required")
    .max(200)
    .regex(
      /^[A-Za-z\s,.]+$/,
      "Qualifications must contain only letters, spaces, commas, and periods"
    ),
  specializations: z
    .string()
    .trim()
    .min(1, "Specializations are required")
    .max(200)
    .regex(
      /^[A-Za-z\s,.]+$/,
      "Specializations must contain only letters, spaces, commas, and periods"
    ),
  experience: z.string().trim().min(1, "Experience is required"),
  salary: z.string().trim().min(1, "Salary is required"),
  gender: z.enum(["Male", "Female", "Other"], {
    errorMap: () => ({ message: "Gender must be Male, Female, or Other" }),
  }),
  dateOfBirth: z
    .string()
    .trim()
    .min(1, "Date of birth is required")
    .refine(validatePastDate, "Date of birth must be a past date"),
  bloodGroup: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], {
    errorMap: () => ({ message: "Invalid blood group" }),
  }),
  nationalId: z
    .string()
    .trim()
    .min(1, "National ID is required")
    .max(30)
    .regex(/^NID\d{3}$/, "National ID must be in the format NID001"),
  phone: z
    .string()
    .trim()
    .min(1, "Phone is required")
    .regex(/^[1-9]\d{9}$/, "Phone number must be exactly 10 digits and cannot start with 0"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Invalid email address")
    .toLowerCase(),
  house: z
    .string()
    .trim()
    .min(1, "House / Street is required")
    .max(100)
    .regex(
      /^(?=.*[A-Za-z])[A-Za-z0-9\s]+$/,
      "House / Street must contain letters and cannot consist of numbers only or contain special characters"
    ),
  area: z
    .string()
    .trim()
    .min(1, "Area is required")
    .max(100)
    .regex(
      /^(?=.*[A-Za-z])[A-Za-z0-9\s]+$/,
      "Area must contain letters and cannot consist of numbers only or contain special characters"
    ),
  city: z
    .string()
    .trim()
    .min(1, "City is required")
    .max(100)
    .regex(/^[A-Za-z\s]+$/, "City must contain only letters and spaces"),
  state: z.string().trim().min(1, "State is required").max(100),
  postalCode: z
    .string()
    .trim()
    .min(1, "Postal code is required")
    .regex(/^\d{6}$/, "Postal code must be exactly 6 digits")
    .refine((val) => val !== "000000", "Invalid postal code"),
  country: z.string().trim().min(1, "Country is required").max(100),
});

export const updateTeacherSchema = createTeacherSchema.extend({
  removePhoto: z.string().optional(),
});
