const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');

class AuthenticationsService {
  constructor() {
    this._pool = new Pool();

    /**
     * The table name
     * @type {string}
     */
    this._tableName = 'authentications';
  }

  /**
   * Add a new refresh token.
   * @param {string} token The  refresh token to add.
   * @throws {InvariantError} If failed to add the refresh token.
   */
  async addRefreshToken(token) {
    const result = await this._pool.query({
      text: `INSERT INTO ${this._tableName} (token) VALUES ($1) RETURNING token`,
      values: [token],
    });

    if (!result.rowCount) {
      throw new InvariantError('Failed to add refresh token');
    }
  }

  /**
   * Verify if the refresh token is valid.
   * @param {string} token The refresh token to check.
   * @throws {InvariantError} If the refresh token is invalid.
   */
  async verifyRefreshToken(token) {
    const result = await this._pool.query({
      text: `SELECT token FROM ${this._tableName} WHERE token = $1`,
      values: [token],
    });

    if (!result.rowCount) {
      throw new InvariantError('Refresh token tidak valid');
    }
  }

  /**
   * Delete the refresh token.
   * @param {string} token The refresh token to delete.
   * @throws {InvariantError} If failed to delete the refresh token.
   */
  async deleteRefreshToken(token) {
    const result = await this._pool.query({
      text: `DELETE FROM ${this._tableName} WHERE token = $1 RETURNING token`,
      values: [token],
    });

    if (!result.rowCount) {
      throw new InvariantError('Failed to delete refresh token');
    }
  }
}

module.exports = AuthenticationsService;
