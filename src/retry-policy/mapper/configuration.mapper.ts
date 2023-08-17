import { UpdateConfiguration } from '../common';
import { UpdateConfigurationDTO } from '../dtos/update-configuration.dto';

export class ConfigurationMapper {
  public static transform = (
    request: UpdateConfigurationDTO
  ): UpdateConfiguration => {
    const response: UpdateConfiguration = {};
    if (request.getTime()) response.time = request.time;
    if (typeof request.getEnabled() !== undefined)
      response.enabled = request.getEnabled();
    if (request.getCountry()) response.country = request.getCountry();
    if (request.getAcquirer()) response.acquirer = request.getAcquirer();
    if (request.getFailCodes()) response.failCodes = request.getFailCodes();
    return response;
  };
}
