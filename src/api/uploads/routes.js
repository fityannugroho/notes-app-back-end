// eslint-disable-next-line no-unused-vars
const Hapi = require('@hapi/hapi');

/**
 * @param {*} handler
 * @returns {Hapi.ServerRoute[]}
 */
const routes = (handler) => [
  {
    method: 'POST',
    path: '/upload/images',
    handler: handler.postUploadImageHandler,
    options: {
      payload: {
        allow: 'multipart/form-data',
        multipart: true,
        output: 'stream',
      },
    },
  },
];

module.exports = routes;
