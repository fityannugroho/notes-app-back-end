class NotesHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    // Bind the handlers to this class.
    this.postNoteHandler = this.postNoteHandler.bind(this);
    this.getNotesHandler = this.getNotesHandler.bind(this);
    this.getNoteByIdHandler = this.getNoteByIdHandler.bind(this);
    this.putNoteByIdHandler = this.putNoteByIdHandler.bind(this);
    this.deleteNoteByIdHandler = this.deleteNoteByIdHandler.bind(this);
  }

  async postNoteHandler(request, h) {
    this._validator.validateNotePayload(request.payload);

    const { title = 'untitled', body, tags } = request.payload;
    const noteId = await this._service.addNote({ title, body, tags });

    return h.response({
      status: 'success',
      message: 'Catatan berhasil ditambahkan',
      data: { noteId },
    }).code(201);
  }

  async getNotesHandler(response, h) {
    const notes = await this._service.getNotes();

    return h.response({
      status: 'success',
      data: { notes },
    });
  }

  async getNoteByIdHandler(request, h) {
    const { id } = request.params;
    const note = await this._service.getNoteById(id);

    return h.response({
      status: 'success',
      data: { note },
    });
  }

  async putNoteByIdHandler(request, h) {
    this._validator.validateNotePayload(request.payload);

    const { id } = request.params;
    const { title, body, tags } = request.payload;
    await this._service.editNoteById(id, { title, body, tags });

    return h.response({
      status: 'success',
      message: 'Catatan berhasil diperbarui',
    });
  }

  async deleteNoteByIdHandler(request, h) {
    const { id } = request.params;
    await this._service.deleteNoteById(id);

    return h.response({
      status: 'success',
      message: 'Catatan berhasil dihapus',
    });
  }
}

module.exports = NotesHandler;
