import { IsEnum, IsNotEmpty } from 'class-validator';
import { Constants } from '../../constants';
import { Expose } from 'class-transformer';
/* istanbul ignore file */

export class TimeDTO {
  constructor(args: any) {
    if (args) {
      if (args.type) this.type = args.type;
    }
  }
  @IsNotEmpty()
  @Expose()
  @IsEnum(Constants.TYPE_DATA, {
    message: `type must be one of these valid values: [${Object.values(
      Constants.TYPE_DATA
    )}]`
  })
  private type: string;

  public getType(): string {
    return this.type;
  }
  public setType(value: string) {
    this.type = value;
  }
}
