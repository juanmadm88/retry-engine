import { IsNotEmpty, IsNumber } from 'class-validator';
/* istanbul ignore file */

export class DataDTO {
  constructor(args: any) {
    if (args) {
      if (args.retries) this.retries = args.retries;
      if (args.timePeriod) this.timePeriod = args.timePeriod;
    }
  }
  @IsNotEmpty()
  @IsNumber()
  private retries: number;

  @IsNotEmpty()
  @IsNumber()
  private timePeriod: number;

  public getRetries(): number {
    return this.retries;
  }
  public setRetries(value: number) {
    this.retries = value;
  }
  public getTimePeriod(): number {
    return this.timePeriod;
  }
  public setTimePeriod(value: number) {
    this.timePeriod = value;
  }
}
