const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const AuthorizationError = require('../../exceptions/AuthorizationError');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapDBToModel } = require('../../utils');

class NotesService {
  constructor(collaborationsService) {
    this._pool = new Pool();
    this._collaborationsService = collaborationsService;
  }

  /**
   * Add new note to the list.
   * @param {object} attributes The note's attributes.
   * @returns {Promise<string>} id of the new note.
   * @throws {Error} if failed to add note.
   */
  async addNote({
    title, body, tags, ownerId,
  }) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const result = await this._pool.query({
      text: 'INSERT INTO notes (id, title, body, tags, created_at, updated_at, owner) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, title, body, tags, createdAt, updatedAt, ownerId],
    });

    if (!result.rows[0].id) {
      throw new InvariantError('Catatan gagal ditambahkan');
    }

    return id;
  }

  /**
   * Get all notes that belong to a user.
   * @param {string} userId The user's id.
   * @returns {Promise<object[]>} list of notes.
   */
  async getNotes(userId) {
    const result = await this._pool.query({
      text: 'SELECT * FROM notes WHERE owner = $1',
      values: [userId],
    });

    return result.rows.map(mapDBToModel);
  }

  /**
   * Get note by id.
   * @param {string} id The note's id.
   * @returns {Promise<object>} note.
   * @throws {Error} if note not found.
   */
  async getNoteById(id) {
    const result = await this._pool.query({
      text: 'SELECT * FROM notes WHERE id = $1',
      values: [id],
    });

    if (!result.rows.length) {
      throw new NotFoundError('Catatan tidak ditemukan');
    }

    return result.rows.map(mapDBToModel)[0];
  }

  /**
   * Update a note by id.
   * @param {string} id The note's id.
   * @param {object} attributes The updated note's attributes.
   * @throws {Error} if note not found.
   */
  async editNoteById(id, { title, body, tags }) {
    const updatedAt = new Date().toISOString();
    const result = await this._pool.query({
      text: 'UPDATE notes SET title = $1, body = $2, tags = $3, updated_at = $4 WHERE id = $5 RETURNING id',
      values: [title, body, tags, updatedAt, id],
    });

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui catatan. Id tidak ditemukan');
    }
  }

  /**
   * Delete a note by id.
   * @param {string} id The note's id.
   * @throws {Error} if note not found.
   */
  async deleteNoteById(id) {
    const result = await this._pool.query({
      text: 'DELETE FROM notes WHERE id = $1 RETURNING id',
      values: [id],
    });

    if (!result.rows.length) {
      throw new NotFoundError('Catatan gagal dihapus. Id tidak ditemukan');
    }
  }

  /**
   * Check if user is owner of the note.
   * @param {string} id The note's id.
   * @param {string} userId The id of user who is trying to access the note.
   * @throws {NotFoundError} if note not found.
   * @throws {AuthorizationError} if user is not the note's owner.
   */
  async verifyNoteOwner(id, userId) {
    const result = await this._pool.query({
      text: 'SELECT * FROM notes WHERE id = $1',
      values: [id],
    });

    if (!result.rowCount) {
      throw new NotFoundError('Catatan tidak ditemukan');
    }

    if (userId !== result.rows[0].owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  /**
   * Check if user is owner of the note or the collaborator.
   * @param {string} id The note's id.
   * @param {string} userId The id of user who is trying to access the note.
   * @throws {NotFoundError} if note not found.
   * @throws {AuthorizationError} if user is not the owner or the collaborator of the note.
   */
  async verifyNoteAccess(id, userId) {
    // Check if user is owner of the note.
    try {
      await this.verifyNoteOwner(id, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      // Check if user is collaborator of the note.
      try {
        await this._collaborationsService.verifyCollaborator(id, userId);
      } catch {
        throw error;
      }
    }
  }
}

module.exports = NotesService;
