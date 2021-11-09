const Model = require('../data/models/form-data');

const addFormData = async(data) => {
  try {
    const answerAt = Date.now();
    data.answeredAt = answerAt;
    const dado = await Model.create(data);
    return dado;
  } catch (error) {
    const err = {
      message: error.message,
      code: 400,
    };
    throw err;
  }
};


module.exports = {
  addFormData: addFormData,
};
