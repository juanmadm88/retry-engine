const generateKey = (args: object = {}): string => {
  let key = '';
  const length: number = Object.keys(args).length;
  Object.keys(args)
    .sort()
    .forEach((attribute, index) => {
      if (attribute in args && args[attribute] !== undefined) {
        if (index < length - 1) {
          return (key = key.concat(`${args[attribute]}-`));
        }
        key = key.concat(`${args[attribute]}`);
      }
    });
  const lastValue: string = key.charAt(key.length - 1);
  if (lastValue === '-') key = key.substring(0, key.length - 1);
  return key;
};

export default generateKey;
