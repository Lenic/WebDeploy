function* eachAll(list) {
  for (let i = 0; i < list.length; i++) {
    yield list[i];
  }
}

export default function asyncEach(list, callback) {
  if (!list.length) {
    return;
  }

  const data = eachAll(list.concat([]))
    , executor = value => callback(value, () => {
      const item = data.next();
      if (!item.done) {
        executor(item.value);
      }
      return item.done;
    });

  const item = data.next();
  if (!item.done) {
    executor(item.value);
  }
}
