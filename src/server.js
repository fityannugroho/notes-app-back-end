require('dotenv').config();

const Hapi = require('@hapi/hapi');
const NotesService = require('./services/postgres/NotesService');
const notes = require('./api/notes');
const NotesValidator = require('./validator/notes');
const users = require('./api/users');
const UsersService = require('./services/postgres/UsersService');
const UsersValidator = require('./validator/users');

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  // Register the plugins.
  await server.register([
    // Notes plugin
    {
      plugin: notes,
      options: {
        service: new NotesService(),
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
  ]);

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
