import multer from "multer";

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const ext = file.originalname.split(".").pop()?.toLowerCase();
    const isExtAllowed = ext ? allowedTypes.test(ext) : false;
    const isMimeAllowed = allowedTypes.test(file.mimetype);//"image/png"

    if (isExtAllowed && isMimeAllowed) {
      cb(null, true);
    } else {
      cb(new Error("Only images (jpeg, jpg, png, webp) are allowed."));
    }
  },
});
