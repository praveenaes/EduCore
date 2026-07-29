import dotenv from "dotenv";
dotenv.config();
export const ENV = {
  PORT: process.env.PORT || "5000",
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/educore",
  JWT_SECRET: process.env.JWT_SECRET || "mySuperSecret_123",
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
  NODE_ENV: process.env.NODE_ENV || "development",


  JWT_ACCESS_EXPIRATION:process.env.JWT_ACCESS_EXPIRATION,
  JWT_REFRESH_EXPIRATION:process.env.JWT_REFRESH_EXPIRATION,

  ADMIN_EMAIL:process.env.ADMIN_EMAIL,
  ADMIN_PASSWORD:process.env.ADMIN_PASSWORD,
  ADMIN_NAME:process.env.ADMIN_NAME,

  SMTP_HOST: process.env.SMTP_HOST, 
  SMTP_PORT: process.env.SMTP_PORT, 
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,

  RESET_PASS_TOKEN_EXPIRY:process.env.RESET_PASS_TOKEN_EXPIRY,

  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  AWS_REGION: process.env.AWS_REGION,
  AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
};

