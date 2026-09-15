import * as yup from "yup";

//Create a Yup validation object.
export const loginValidationSchema = yup.object().shape({
  email: yup
    .string()
    .required("Email address is required")//if empty 
    .email("Valid email required"),//frontend err
  password: yup
    .string()
    .required("Password is required")//if empty
    .min(8, "Password should be at least 8 characters"),//frontend err
});

export const registerValidationSchema = yup.object().shape({
  name: yup
    .string()
    .required("Name is required"),
  email: yup
    .string()
    .required("Email address is required")
    .email("Valid email required"),
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password should be at least 8 characters"),
  confirmPassword: yup
    .string()
    .required("Confirm password is required")
    .oneOf([yup.ref("password")], "Passwords must match"),
});

export const forgotPasswordValidationSchema = yup.object().shape({
  email: yup
    .string()
    .required("Email address is required")
    .email("Valid email required"),
});

export const verifyOtpValidationSchema = yup.object().shape({
  otp: yup
    .string()
    .required("OTP is required")
    .length(6, "OTP must be exactly 6 digits")
    .matches(/^\d+$/, "OTP must contain only numbers"),
});

export const resetPasswordValidationSchema = yup.object().shape({
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(/[a-z]/, "Must contain at least one lowercase letter")
    .matches(/[A-Z]/, "Must contain at least one uppercase letter")
    .matches(/[0-9]/, "Must contain at least one number")
    .matches(/[^a-zA-Z0-9]/, "Must contain at least one special character"),
  confirmPassword: yup
    .string()
    .required("Confirm password is required")
    .oneOf([yup.ref("password")], "Passwords must match"),
});
