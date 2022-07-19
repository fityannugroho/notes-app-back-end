const bcrypt = require('bcrypt');
const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const AuthenticationError = require('../../exceptions/AuthenticationError');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class UsersService {
  constructor() {
    this._pool = new Pool();

    /**
     * The table name
     * @type {string}
     */
    this._tableName = 'users';
  }

  /**
   * Creates a new user.
   * @param {object} user - The user object.
   * @returns {Promise<string>} The user id.
   * @throws {InvariantError} If user already exists or if failed to create user.
   */
  async addUser({ username, password, fullname }) {
    await this.verifyNewUsername(username);

    const id = `user-${nanoid(16)}`;
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await this._pool.query({
      text: `INSERT INTO ${this._tableName} (id, username, password, fullname) VALUES ($1, $2, $3, $4) RETURNING id`,
      values: [id, username, hashedPassword, fullname],
    });

    if (!result.rowCount) {
      throw new InvariantError('User gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  /**
   * Verify if user exists in database.
   * @param {string} username The username to verify.
   * @throws {InvariantError} If user already exists.
   */
  async verifyNewUsername(username) {
    const result = await this._pool.query({
      text: `SELECT username FROM ${this._tableName} WHERE username = $1`,
      values: [username],
    });

    if (result.rowCount > 0) {
      throw new InvariantError('Gagal menambahkan user. Username sudah digunakan.');
    }
  }

  /**
   * Get an user by id.
   * @param {string} id The user id.
   * @returns {Promise<object>} The user object.
   * @throws {NotFoundError} If user does not exist.
   */
  async getUserById(id) {
    const result = await this._pool.query({
      text: `SELECT id, username, fullname FROM ${this._tableName} WHERE id = $1`,
      values: [id],
    });

    if (!result.rowCount) {
      throw new NotFoundError('User tidak ditemukan');
    }

    return result.rows[0];
  }

  /**
   * Verify the user credentials.
   * @param {string} username The username.
   * @param {string} password The password.
   * @throws {AuthenticationError} If user credentials are invalid.
   */
  async verifyUserCredential(username, password) {
    const result = await this._pool.query({
      text: `SELECT id, username, password FROM ${this._tableName} WHERE username = $1`,
      values: [username],
    });

    if (!result.rowCount) {
      throw new AuthenticationError('Kredensial yang Anda berikan salah');
    }

    const { id, password: hashedPassword } = result.rows[0];
    const isValid = await bcrypt.compare(password, hashedPassword);

    if (!isValid) {
      throw new AuthenticationError('Kredensial yang Anda berikan salah');
    }

    return id;
  }
}

module.exports = UsersService;
