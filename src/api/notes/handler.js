class NotesHandler {
  constructor(service) {
    this._service = service;
  }

  postNoteHandler(request, h) {
    const { title = 'untitled', body, tags } = request.payload;
    try {
      const noteId = this._service.addNote({ title, body, tags });
      return h.response({
        status: 'success',
        message: 'Catatan berhasil ditambahkan',
        data: { noteId },
      }).code(201);
    } catch (error) {
      return h.response({
        status: 'fail',
        message: error.message,
      }).code(400);
    }
  }

  getNotesHandler() {
    const notes = this._service.getNotes();
    return {
      status: 'success',
      data: {
        notes,
      },
    };
  }

  getNoteByIdHandler(request, h) {
    const { id } = request.params;
    try {
      const note = this._service.getNoteById(id);
      return {
        status: 'success',
        data: { note },
      };
    } catch (error) {
      return h.response({
        status: 'fail',
        message: error.message,
      }).code(404);
    }
  }

  putNoteByIdHandler(request, h) {
    const { id } = request.params;
    const { title, body, tags } = request.payload;
    try {
      this._service.updateNoteById(id, { title, body, tags });
      return {
        status: 'success',
        message: 'Catatan berhasil diperbarui',
      };
    } catch (error) {
      return h.response({
        status: 'fail',
        message: error.message,
      }).code(404);
    }
  }

  deleteNoteByIdHandler(request, h) {
    const { id } = request.params;
    try {
      this._service.deleteNoteById(id);
      return {
        status: 'success',
        message: 'Catatan berhasil dihapus',
      };
    } catch (error) {
      return h.response({
        status: 'fail',
        message: error.message,
      }).code(404);
    }
  }
}

module.exports = NotesHandler;
