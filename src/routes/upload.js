const util = require('util');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');

var storage = new GridFsStorage({
  // url: 'mongodb://localhost:27017/sample_db',
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    const match = ['image/png', 'image/jpeg'];

    if (match.indexOf(file.mimetype) === -1) {
      const filename = `${Date.now()}-bezkoder-${file.originalname}`;
      return filename;
    }

    return {
      bucketName: 'photos',
      filename: `${Date.now()}-bezkoder-${file.originalname}`,
    };
  },
});
