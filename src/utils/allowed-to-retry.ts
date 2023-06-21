const allowedToRetry = (
  statusCode: any,
  failCodes: string[],
  error: any,
  timeoutCodes: string[]
): boolean => {
  const stringiedCodes: string[] = failCodes.map((code) => String(code));
  return (
    stringiedCodes.includes(statusCode?.toString()) ||
    timeoutCodes.includes(error.code)
  );
};

export default allowedToRetry;
