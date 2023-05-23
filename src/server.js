require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const Inert = require('@hapi/inert');
const path = require('path');
const ClientError = require('./exceptions/ClientError');
const notes = require('./api/notes');
const NotesService = require('./services/postgres/NotesService');
const NotesValidator = require('./validator/notes');
const users = require('./api/users');
const UsersService = require('./services/postgres/UsersService');
const UsersValidator = require('./validator/users');
const authentications = require('./api/authentications');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const TokenManager = require('./tokenize/TokenManager');
const AuthenticationsValidator = require('./validator/authentications');
const CollaborationsService = require('./services/postgres/CollaborationsService');
const collaborations = require('./api/collaborations');
const CollaborationsValidator = require('./validator/collaborations');
const _exports = require('./api/exports');
const ProducerService = require('./services/rabbitmq/ProducerService');
const ExportsValidator = require('./validator/exports');
const StorageService = require('./services/storage/StorageService');
const S3StorageService = require('./services/s3/StorageService');
const uploads = require('./api/uploads');
const UploadsValidator = require('./validator/uploads');

const init = async () => {
  const collaborationsService = new CollaborationsService();
  const notesService = new NotesService(collaborationsService);
  const storageService = (process.env.STORAGE_PROVIDER === 's3')
    ? new S3StorageService()
    : new StorageService(path.resolve(__dirname, 'api/uploads/file/images'));

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  // Register external plugins
  await server.register([
    {
      plugin: Jwt,
    },
    {
      plugin: Inert,
    },
  ]);

  // Define jwt authentication strategy.
  server.auth.strategy('notesapp_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  // Register internal plugins.
  await server.register([
    // Notes plugin
    {
      plugin: notes,
      options: {
        service: notesService,
        validator: NotesValidator,
      },
    },
    // Users plugin.
    {
      plugin: users,
      options: {
        service: new UsersService(),
        validator: UsersValidator,
      },
    },
    // Authentications plugin.
    {
      plugin: authentications,
      options: {
        authenticationsService: new AuthenticationsService(),
        usersService: new UsersService(),
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
    // Collaborations plugin.
    {
      plugin: collaborations,
      options: {
        collaborationsService,
        notesService,
        validator: CollaborationsValidator,
      },
    },
    // Exports plugin.
    {
      plugin: _exports,
      options: {
        service: ProducerService,
        validator: ExportsValidator,
      },
    },
    // Uploads plugin.
    {
      plugin: uploads,
      options: {
        service: storageService,
        validator: UploadsValidator,
      },
    },
  ]);

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    // Handle the client errors.
    if (response instanceof ClientError) {
      return h.response({
        status: 'fail',
        message: response.message,
      }).code(response.statusCode);
    }

    // Handle the server errors.
    if (response.isServer) {
      console.error(`${response.name}: ${response.message}\n${response.stack}\n`);
      return h.response({
        status: 'error',
        message: 'Maaf, terjadi kesalahan pada server kami',
      }).code(500);
    }

    return h.continue;
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
