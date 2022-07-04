const { nanoid } = require('nanoid');

class NotesService {
  constructor() {
    this._notes = [];
  }

  /**
   * Add new note to the list.
   * @param {object} attributes The note's attributes.
   * @returns {string} id of the new note.
   * @throws {Error} if failed to add note.
   */
  addNote({ title, body, tags }) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const newNote = {
      title, tags, body, id, createdAt, updatedAt,
    };

    this._notes.push(newNote);

    const isSuccess = this._notes.filter((note) => note.id === id).length > 0;

    if (!isSuccess) {
      throw new Error('Catatan gagal ditambahkan');
    }

    return id;
  }

  /**
   * Get all notes.
   * @returns {array} list of notes.
   */
  getNotes() {
    return this._notes;
  }

  /**
   * Get note by id.
   * @param {string} id The note's id.
   * @returns {object} note.
   * @throws {Error} if note not found.
   */
  getNoteById(id) {
    const searchedNote = this._notes.find((note) => note.id === id);

    if (!searchedNote) {
      throw new Error('Catatan tidak ditemukan');
    }

    return searchedNote;
  }

  /**
   * Update a note by id.
   * @param {string} id The note's id.
   * @param {object} attributes The updated note's attributes.
   * @throws {Error} if note not found.
   */
  editNoteById(id, { title, body, tags }) {
    const index = this._notes.findIndex((note) => note.id === id);

    if (index === -1) {
      throw new Error('Gagal memperbarui catatan. Id tidak ditemukan');
    }

    const updatedAt = new Date().toISOString();

    this._notes[index] = {
      ...this._notes[index],
      title,
      tags,
      body,
      updatedAt,
    };
  }

  /**
   * Delete a note by id.
   * @param {string} id The note's id.
   * @throws {Error} if note not found.
   */
  deleteNoteById(id) {
    const index = this._notes.findIndex((note) => note.id === id);

    if (index === -1) {
      throw new Error('Catatan gagal dihapus. Id tidak ditemukan');
    }

    this._notes.splice(index, 1);
  }
}

module.exports = NotesService;
