import {
  IsBoolean,
  IsObject,
  IsString,
  IsOptional,
  IsNotEmpty,
  IsNotEmptyObject,
  IsEnum
} from 'class-validator';
import { Constants } from '../../constants';
/* istanbul ignore file */

export class ConfigurationDTO {
  constructor(args: any) {
    if (args) {
      const { timeSerie, enabled, country, _id, created_at, acquirer } = args;
      if (timeSerie) this.timeSerie = timeSerie;
      if ('enabled' in args) this.enabled = enabled;
      if (country) this.country = country;
      if (_id) this._id = _id;
      if (created_at) this.created_at = created_at;
      if (acquirer) this.acquirer = acquirer;
    }
  }

  @IsNotEmpty()
  @IsString()
  private country: string;

  @IsNotEmpty()
  @IsString()
  @IsEnum(Object.keys(Constants.typesCall), {
    message: `acquirer must have  one of these valid values: [${Object.keys(
      Constants.typesCall
    )}]`
  })
  private acquirer: string;

  @IsOptional()
  @IsBoolean()
  private enabled?: boolean;

  @IsNotEmptyObject()
  @IsObject()
  private timeSerie: object;

  @IsOptional()
  private _id?: any;

  @IsOptional()
  private created_at?: any;

  public getTimeSerie(): object {
    return this.timeSerie;
  }
  public setTimeSerie(value: object) {
    this.timeSerie = value;
  }

  public getEnabled(): boolean {
    return this.enabled;
  }
  public setEnabled(value: boolean) {
    this.enabled = value;
  }

  public getCountry(): string {
    return this.country;
  }
  public setCountry(value: string) {
    this.country = value;
  }

  public getId(): any {
    return this._id;
  }
  public setId(value: any) {
    this._id = value;
  }

  public getCreatedAt(): any {
    return this.created_at;
  }
  public setCreatedAt(value: any) {
    this.created_at = value;
  }

  public getAcquirer(): string {
    return this.acquirer;
  }
  public setAcquirer(value: string) {
    this.acquirer = value;
  }
}
