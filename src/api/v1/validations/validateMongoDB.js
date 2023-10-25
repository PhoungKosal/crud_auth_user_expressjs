const mongoose = require('mongoose');

const validateMongoDBID = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid or not found MongoDB ObjectId');
  }
};

module.exports = validateMongoDBID;
