import { Expose } from 'class-transformer';
import { IsObject, IsOptional, IsString } from 'class-validator';
/* istanbul ignore file */

export class ResponseDTO {
  constructor(args: any = {}) {
    const {
      transaction_type,
      payment_method,
      response_code,
      response_description,
      transaction
    } = args;
    if (transaction_type) this.transaction_type = transaction_type;
    if (payment_method) this.payment_method = payment_method;
    if (response_code) this.response_code = response_code;
    if (response_description) this.response_description = response_description;
    if (transaction) this.response_description = transaction;
  }

  @IsOptional()
  @IsString()
  @Expose()
  private transaction_type?: string;

  @IsOptional()
  @IsString()
  @Expose()
  private payment_method?: string;

  @IsOptional()
  @IsString()
  @Expose()
  private response_code: string;

  @IsOptional()
  @IsString()
  @Expose()
  private response_description?: string;

  @IsOptional()
  @IsObject()
  @Expose()
  private transaction?: object;

  public getTransactionType(): string {
    return this.transaction_type;
  }
  public setTransactionType(value: string) {
    this.transaction_type = value;
  }

  public getPaymentMethod(): string {
    return this.payment_method;
  }
  public setPaymentMethod(value: string) {
    this.payment_method = value;
  }

  public getResponseCode(): string {
    return this.response_code;
  }
  public setResponseCode(value: string) {
    this.response_code = value;
  }

  public getResponseDescription(): string {
    return this.response_description;
  }
  public setResponseDescription(value: string) {
    this.response_description = value;
  }

  public getTransaction(): object {
    return this.transaction;
  }
  public setTransaction(value: object) {
    this.transaction = value;
  }
}
