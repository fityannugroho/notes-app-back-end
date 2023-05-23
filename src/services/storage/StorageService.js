const fs = require('fs');
const path = require('path');

class StorageService {
  /**
   * @param {fs.PathLike} folder
   */
  constructor(folder) {
    this._folder = folder;

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
  }

  writeFile(file, meta) {
    const filename = `${Date.now()}_${meta.filename}`;
    const filePath = path.resolve(this._folder, filename);
    const fileStream = fs.createWriteStream(filePath);

    return new Promise((resolve, reject) => {
      fileStream.on('error', reject);
      file.pipe(fileStream);
      file.on('end', () => resolve(filename));
    });
  }
}

module.exports = StorageService;
