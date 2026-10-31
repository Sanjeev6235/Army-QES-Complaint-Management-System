const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const mimeToExtension = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp'
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const extension = mimeToExtension[file.mimetype];
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `complaint-${uniqueSuffix}${extension}`);
  }
});

const fileFilter = (_req, file, cb) => {
  const expectedExtension = mimeToExtension[file.mimetype];
  const suppliedExtension = path.extname(file.originalname).toLowerCase();
  if (!expectedExtension || !['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(suppliedExtension)) {
    return cb(new Error('Only JPG, PNG, GIF and WEBP images are allowed'));
  }
  cb(null, true);
};

module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 5 }
});
