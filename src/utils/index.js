/* eslint-disable camelcase */

const mapDBToModel = ({
  created_at,
  updated_at,
  ...others
}) => ({
  ...others,
  createdAt: created_at,
  updatedAt: updated_at,
});

module.exports = { mapDBToModel };
