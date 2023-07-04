import { IsNotEmptyObject } from 'class-validator';
import { TimeDTO } from './time.dto';
import { Expose } from 'class-transformer';
/* istanbul ignore file */

export class SerieDTO extends TimeDTO {
  constructor(args: any) {
    super(args);
    if (args) {
      if (args.data) this.data = args.data;
    }
  }
  @IsNotEmptyObject()
  @Expose()
  private data: object;

  public getData(): object {
    return this.data;
  }
  public setData(value: object) {
    this.data = value;
  }
}
