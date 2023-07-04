import { Constants } from '../constants';
import { plainToInstance } from 'class-transformer';

const buildResponse = (dtoName: string, args: any = {}): any => {
  const entityPath: string = Constants.PATHS[dtoName];
  const dto = require(`../${entityPath}/dtos`); // eslint-disable-line
  return plainToInstance(dto[dtoName], args, { excludeExtraneousValues: true });
};

export default buildResponse;
