/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  // Create new user to be used as owner of ownerless old notes.
  pgm.sql("INSERT INTO users (id, username, password, fullname) VALUES ('old_notes', 'old_notes', 'old_notes', 'old_notes')");

  // Update owner column of old notes to new user.
  pgm.sql("UPDATE notes SET owner = 'old_notes' WHERE owner = NULL");

  // Add foreign key constraint to owner column.
  pgm.addConstraint('notes', 'fk_notes.owner_users.id', 'FOREIGN KEY (owner) REFERENCES users (id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  // Drop foreign key constraint from owner column.
  pgm.dropConstraint('notes', 'fk_notes.owner_users.id');

  // Change old notes owner to NULL.
  pgm.sql("UPDATE notes SET owner = NULL WHERE owner = 'old_notes'");

  // Delete `old_notes` user.
  pgm.sql("DELETE FROM users WHERE id = 'old_notes'");
};
