const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');

class CollaborationsService {
  constructor() {
    this._pool = new Pool();

    /**
     * The table name
     * @type {string}
     */
    this._tableName = 'collaborations';
  }

  /**
   * Add a new collaboration for a note to an user.
   * @param {string} noteId The note id.
   * @param {string} userId The user id.
   * @returns {Promise<string>} The id of the new collaboration.
   * @throws {InvariantError} If failed to add a new collaboration.
   */
  async addCollaboration(noteId, userId) {
    const id = `collab-${nanoid(16)}`;

    const result = await this._pool.query({
      text: `INSERT INTO ${this._tableName} (id, note_id, user_id) VALUES ($1, $2, $3) RETURNING id`,
      values: [id, noteId, userId],
    });

    if (!result.rowCount) {
      throw new InvariantError('Kolaborasi gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  /**
   * Remove a collaboration for a note to an user.
   * @param {string} noteId The note id.
   * @param {string} userId The user id.
   * @throws {InvariantError} If failed to remove a collaboration.
   */
  async deleteCollaboration(noteId, userId) {
    const result = await this._pool.query({
      text: `DELETE FROM ${this._tableName} WHERE note_id = $1 AND user_id = $2 RETURNING id`,
      values: [noteId, userId],
    });

    if (!result.rowCount) {
      throw new InvariantError('Kolaborasi gagal dihapus');
    }
  }

  /**
   * Verify if an user is a collaborator for a note.
   * @param {string} noteId The note id.
   * @param {string} userId The user id.
   * @throws {InvariantError} If an user is not a collaborator for a note.
   */
  async verifyCollaborator(noteId, userId) {
    const result = await this._pool.query({
      text: `SELECT * FROM ${this._tableName} WHERE note_id = $1 AND user_id = $2`,
      values: [noteId, userId],
    });

    if (!result.rowCount) {
      throw new InvariantError('Kolaborasi gagal diverifikasi');
    }
  }
}

module.exports = CollaborationsService;
