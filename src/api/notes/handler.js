const ClientError = require('../../exceptions/ClientError');

class NotesHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
    this._serverErrorResponse = {
      status: 'error',
      message: 'Maaf, terjadi kesalahan pada server kami',
    };

    // Bind the handlers to this class.
    this.postNoteHandler = this.postNoteHandler.bind(this);
    this.getNotesHandler = this.getNotesHandler.bind(this);
    this.getNoteByIdHandler = this.getNoteByIdHandler.bind(this);
    this.putNoteByIdHandler = this.putNoteByIdHandler.bind(this);
    this.deleteNoteByIdHandler = this.deleteNoteByIdHandler.bind(this);
  }

  async postNoteHandler(request, h) {
    try {
      this._validator.validateNotePayload(request.payload);

      const { title = 'untitled', body, tags } = request.payload;
      const noteId = await this._service.addNote({ title, body, tags });

      return h.response({
        status: 'success',
        message: 'Catatan berhasil ditambahkan',
        data: { noteId },
      }).code(201);
    } catch (error) {
      if (error instanceof ClientError) {
        return h.response({
          status: 'fail',
          message: error.message,
        }).code(error.statusCode);
      }

      // Server error.
      console.error(error);
      return h.response(this._serverErrorResponse).code(500);
    }
  }

  async getNotesHandler() {
    const notes = await this._service.getNotes();
    return {
      status: 'success',
      data: {
        notes,
      },
    };
  }

  async getNoteByIdHandler(request, h) {
    const { id } = request.params;
    try {
      const note = await this._service.getNoteById(id);
      return {
        status: 'success',
        data: { note },
      };
    } catch (error) {
      if (error instanceof ClientError) {
        return h.response({
          status: 'fail',
          message: error.message,
        }).code(error.statusCode);
      }

      // Server error.
      console.error(error);
      return h.response(this._serverErrorResponse).code(500);
    }
  }

  async putNoteByIdHandler(request, h) {
    try {
      this._validator.validateNotePayload(request.payload);

      const { id } = request.params;
      const { title, body, tags } = request.payload;
      await this._service.editNoteById(id, { title, body, tags });

      return {
        status: 'success',
        message: 'Catatan berhasil diperbarui',
      };
    } catch (error) {
      if (error instanceof ClientError) {
        return h.response({
          status: 'fail',
          message: error.message,
        }).code(error.statusCode);
      }

      // Server error.
      console.error(error);
      return h.response(this._serverErrorResponse).code(500);
    }
  }

  async deleteNoteByIdHandler(request, h) {
    const { id } = request.params;
    try {
      await this._service.deleteNoteById(id);
      return {
        status: 'success',
        message: 'Catatan berhasil dihapus',
      };
    } catch (error) {
      if (error instanceof ClientError) {
        return h.response({
          status: 'fail',
          message: error.message,
        }).code(error.statusCode);
      }

      // Server error.
      console.error(error);
      return h.response(this._serverErrorResponse).code(500);
    }
  }
}

module.exports = NotesHandler;
