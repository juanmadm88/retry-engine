import { IsNotEmptyObject, ValidateNested } from 'class-validator';
import { TimeDTO } from './time.dto';
import { DataDTO } from './data.dto';
import { Expose, Type } from 'class-transformer';
/* istanbul ignore file */

export class NonSerieDTO extends TimeDTO {
  constructor(args: any) {
    super(args);
    if (args) {
      if (args.data) this.data = args.data;
    }
  }
  @IsNotEmptyObject()
  @ValidateNested()
  @Expose()
  @Type(() => DataDTO)
  private data: DataDTO;

  public getData(): DataDTO {
    return this.data;
  }
  public setData(value: DataDTO) {
    this.data = value;
  }
}
