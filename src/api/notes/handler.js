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
    const { id: credentialId } = request.auth.credentials;

    const noteId = await this._service.addNote({
      title, body, tags, ownerId: credentialId,
    });

    return h.response({
      status: 'success',
      message: 'Catatan berhasil ditambahkan',
      data: { noteId },
    }).code(201);
  }

  async getNotesHandler(response, h) {
    const { id: credentialId } = response.auth.credentials;
    const notes = await this._service.getNotes(credentialId);

    return h.response({
      status: 'success',
      data: { notes },
    });
  }

  async getNoteByIdHandler(request, h) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyNoteAccess(id, credentialId);
    const note = await this._service.getNoteById(id, credentialId);

    return h.response({
      status: 'success',
      data: { note },
    });
  }

  async putNoteByIdHandler(request, h) {
    this._validator.validateNotePayload(request.payload);

    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;
    await this._service.verifyNoteAccess(id, credentialId);

    const { title, body, tags } = request.payload;
    await this._service.editNoteById(id, { title, body, tags });

    return h.response({
      status: 'success',
      message: 'Catatan berhasil diperbarui',
    });
  }

  async deleteNoteByIdHandler(request, h) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyNoteOwner(id, credentialId);
    await this._service.deleteNoteById(id);

    return h.response({
      status: 'success',
      message: 'Catatan berhasil dihapus',
    });
  }
}

module.exports = NotesHandler;
