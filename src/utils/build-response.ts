import { Constants } from '../constants';

const buildResponse = (dtoName: string, args: any = {}): any => {
  const entityPath: string = Constants.PATHS[dtoName];
  const dto = require(`../${entityPath}/dtos`); // eslint-disable-line
  return new dto[dtoName](args);
};

export default buildResponse;
