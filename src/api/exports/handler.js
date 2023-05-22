class ExportsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postExportNotesHandler = this.postExportNotesHandler.bind(this);
  }

  async postExportNotesHandler(request, h) {
    this._validator.validateExportNotesPayload(request.payload);

    const { id: credentialId } = request.auth.credentials;
    const { targetEmail } = request.payload;

    const message = {
      userId: credentialId,
      targetEmail,
    };

    await this._service.sendMessage('export:notes', JSON.stringify(message));

    return h.response({
      status: 'success',
      message: 'Permintaan Anda dalam antrean',
    }).code(201);
  }
}

module.exports = ExportsHandler;
