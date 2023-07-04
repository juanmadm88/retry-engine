const generateKey = (args: object): string => {
  let key = '';
  const length: number = Object.keys(args).length;
  Object.keys(args).forEach((attribute, index) => {
    if (index < length - 1) {
      return (key = key.concat(`${args[attribute]}-`));
    }
    key = key.concat(`${args[attribute]}`);
  });
  return key;
};

export default generateKey;
