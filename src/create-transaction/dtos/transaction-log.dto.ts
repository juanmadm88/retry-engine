import { Expose, Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsObject,
  IsOptional,
  IsString
} from 'class-validator';
/* istanbul ignore file */

export class TransactionLogDTO {
  constructor(args: any) {
    if (args) {
      const {
        trs_unique_id,
        status,
        type_call,
        trs_type,
        trs_datetime,
        payment_method,
        trs_amount_total,
        acquirer,
        acquirer_unique_id,
        response_code,
        authorization_code,
        data,
        data_error,
        custom_tracking_id,
        trace_id,
        next_execution,
        to_be_reprocessed,
        retries,
        _id,
        created_at
      } = args;
      if (trs_unique_id) this.trs_unique_id = trs_unique_id;
      if (status) this.status = status;
      if (type_call) this.type_call = type_call;
      if (trs_type) this.trs_type = trs_type;
      if (trs_datetime) this.trs_datetime = trs_datetime;
      if (payment_method) this.payment_method = payment_method;
      if (trs_amount_total) this.trs_amount_total = trs_amount_total;
      if (acquirer) this.acquirer = acquirer;
      if (acquirer_unique_id) this.acquirer_unique_id = acquirer_unique_id;
      if (response_code) this.response_code = response_code;
      if (authorization_code) this.authorization_code = authorization_code;
      if (data) this.data = data;
      if (data_error) this.data_error = data_error;
      if (custom_tracking_id) this.custom_tracking_id = custom_tracking_id;
      if (trace_id) this.trace_id = trace_id;
      if (next_execution) this.next_execution = next_execution;
      if (to_be_reprocessed) this.to_be_reprocessed = to_be_reprocessed;
      if (retries) this.retries = retries;
      if (_id) this._id = _id;
      if (created_at) this.created_at = created_at;
    }
  }

  @IsOptional()
  @IsString()
  @Expose()
  private trs_unique_id?: string;

  @IsOptional()
  @IsString()
  @Expose()
  private status?: string;

  @IsOptional()
  @IsString()
  @Expose()
  private type_call?: string;

  @IsOptional()
  @IsString()
  @Expose()
  private trs_type?: string;

  @IsOptional()
  @IsString()
  @Expose()
  private trs_datetime?: string;

  @IsOptional()
  @IsString()
  @Expose()
  private payment_method?: string;

  @IsOptional()
  @IsNumber()
  @Expose()
  private trs_amount_total?: number;

  @IsOptional()
  @IsString()
  @Expose()
  private acquirer?: string;

  @IsOptional()
  @IsString()
  @Expose()
  private acquirer_unique_id?: string;

  @IsOptional()
  @IsString()
  @Expose()
  private response_code?: string;

  @IsOptional()
  @IsString()
  @Expose()
  private authorization_code?: string;

  @IsOptional()
  @IsObject()
  @Expose()
  private data?: object;

  @IsOptional()
  @IsObject()
  @Expose()
  private data_error?: object;

  @IsOptional()
  @IsString()
  @Expose()
  private custom_tracking_id?: string;

  @IsOptional()
  @IsString()
  @Expose()
  private trace_id: string;

  @IsOptional()
  @IsBoolean()
  @Expose()
  private to_be_reprocessed: boolean;

  @IsOptional()
  @IsString()
  @Expose()
  private next_execution: string;

  @IsOptional()
  @IsNumber()
  @Expose()
  private retries: number;

  @IsOptional()
  @Expose()
  @Transform((value) => value.obj._id?.toString())
  private _id: any;

  @IsOptional()
  @Expose()
  private created_at: any;

  public getTrsUniqueId(): string {
    return this.trs_unique_id;
  }
  public setTrsUniqueId(value: string) {
    this.trs_unique_id = value;
  }

  public getStatus(): string {
    return this.status;
  }
  public setStatus(value: string) {
    this.status = value;
  }

  public getTypeCall(): string {
    return this.type_call;
  }
  public setTypeCall(value: string) {
    this.type_call = value;
  }

  public getTrsType(): string {
    return this.trs_type;
  }
  public setTrsType(value: string) {
    this.trs_type = value;
  }

  public getTrsDatetime(): string {
    return this.trs_datetime;
  }
  public setTrsDatetime(value: string) {
    this.trs_datetime = value;
  }

  public getPaymentMethod(): string {
    return this.payment_method;
  }
  public setPaymentMethod(value: string) {
    this.payment_method = value;
  }

  public getTrsAmountTotal(): number {
    return this.trs_amount_total;
  }
  public setTrsAmountTotal(value: number) {
    this.trs_amount_total = value;
  }

  public getAcquirer(): string {
    return this.acquirer;
  }
  public setAcquirer(value: string) {
    this.acquirer = value;
  }

  public getAcquirerUniqueId(): string {
    return this.acquirer_unique_id;
  }
  public setAcquirerUniqueId(value: string) {
    this.acquirer_unique_id = value;
  }

  public getResponseCode(): string {
    return this.response_code;
  }
  public setResponseCode(value: string) {
    this.response_code = value;
  }

  public getAuthorizationCode(): string {
    return this.authorization_code;
  }
  public setAuthorizationCode(value: string) {
    this.authorization_code = value;
  }

  public getData(): object {
    return this.data;
  }
  public setData(value: object) {
    this.data = value;
  }

  public getDataError(): object {
    return this.data_error;
  }
  public setDataError(value: object) {
    this.data_error = value;
  }

  public getTraceId(): string {
    return this.trace_id;
  }
  public setTraceId(value: string) {
    this.trace_id = value;
  }

  public getNextExecution(): string {
    return this.next_execution;
  }
  public setNextExecution(value: string) {
    this.next_execution = value;
  }

  public getRetries(): number {
    return this.retries;
  }
  public setRetries(value: number) {
    this.retries = value;
  }

  public getToBeReprocessed(): boolean {
    return this.to_be_reprocessed;
  }
  public setToBeReprocessed(value: boolean) {
    this.to_be_reprocessed = value;
  }

  public getCustomTrackingId(): string {
    return this.custom_tracking_id;
  }
  public setCustomTrackingId(value: string) {
    this.custom_tracking_id = value;
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
}
