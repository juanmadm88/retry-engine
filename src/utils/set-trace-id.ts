const setTraceId = (data: any, headers: any) => {
  data.trace_id = headers['kong-request-id'];
};
export default setTraceId;
