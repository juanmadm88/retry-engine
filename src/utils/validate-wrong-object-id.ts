import * as mongoose from 'mongoose';
const validateWrongObjectId = (anId: any): boolean => {
  return mongoose.Types.ObjectId.isValid(anId);
};

export default validateWrongObjectId;
