import { Configuration } from '../common';

export class ConfigurationMapper {
  public static transform = (request: any): Configuration => {
    const response: Configuration = {};
    if (request.timeSerie) response.timeSerie = request.timeSerie;
    if ('enabled' in request) response.enabled = request.enabled;
    if (request.country) response.country = request.country;
    if (request.acquirer) response.acquirer = request.acquirer;
    return response;
  };
}
