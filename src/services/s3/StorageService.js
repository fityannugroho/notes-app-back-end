const AWS = require('aws-sdk');

class StorageService {
  constructor() {
    this._s3 = new AWS.S3();
  }

  /**
   * Write a file to storage.
   * @returns {Promise<string>} The url to file location.
   */
  writeFile(file, meta) {
    const parameter = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `${Date.now()}_${meta.filename}`,
      Body: file._data,
      ContentType: meta.headers['content-type'],
    };

    return new Promise((resolve, reject) => {
      this._s3.upload(parameter, (error, data) => {
        if (error) {
          return reject(error);
        }
        return resolve(data.Location);
      });
    });
  }
}

module.exports = StorageService;
