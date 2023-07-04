import {
  IsBoolean,
  IsString,
  IsOptional,
  IsNotEmpty,
  IsEnum,
  ValidateNested,
  IsNumber,
  ArrayNotEmpty
} from 'class-validator';
import { Constants } from '../../constants';
import { TimeDTO } from './time.dto';
import { Expose, Transform, Type } from 'class-transformer';
import { NonSerieDTO } from './non-serie.dto';
import { SerieDTO } from './serie.dto';
/* istanbul ignore file */

export class ConfigurationDTO {
  constructor(args: any) {
    if (args) {
      const { time, enabled, country, _id, created_at, acquirer, failCodes } =
        args;
      if (time) this.time = time;
      if ('enabled' in args) this.enabled = enabled;
      if (country) this.country = country;
      if (_id) this._id = _id;
      if (created_at) this.created_at = created_at;
      if (acquirer) this.acquirer = acquirer;
      if (failCodes) this.failCodes = failCodes;
    }
  }

  @IsNotEmpty()
  @IsString()
  @Expose()
  private country: string;

  @ArrayNotEmpty()
  @Expose()
  @IsNumber({}, { each: true })
  private failCodes: Array<number>;

  @IsNotEmpty()
  @Expose()
  @IsString()
  @IsEnum(Object.keys(Constants.typesCall), {
    message: `acquirer must have  one of these valid values: [${Object.keys(
      Constants.typesCall
    )}]`
  })
  private acquirer: string;

  @IsOptional()
  @IsBoolean()
  @Expose()
  private enabled?: boolean;

  @IsNotEmpty()
  @ValidateNested()
  @Expose()
  @Type(() => TimeDTO, {
    discriminator: {
      property: 'type',
      subTypes: [
        {
          value: NonSerieDTO,
          name: Constants.TYPE_DATA[1] as unknown as string
        },
        { value: SerieDTO, name: Constants.TYPE_DATA[0] as unknown as string }
      ]
    },
    keepDiscriminatorProperty: true
  })
  time: NonSerieDTO | SerieDTO;

  @IsOptional()
  @Expose()
  @Transform((value) => value.obj._id?.toString())
  private _id?: any;

  @IsOptional()
  private created_at?: any;

  public getTime(): NonSerieDTO | SerieDTO {
    return this.time;
  }
  public setTime(value: NonSerieDTO | SerieDTO) {
    this.time = value;
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

  public getFailCodes(): Array<number> {
    return this.failCodes;
  }
  public setFailCodes(value: Array<number>) {
    this.failCodes = value;
  }
}
