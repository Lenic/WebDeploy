export default function() {
  const promise = {
    resolve: null,
    reject: null,
    promise: null,
  };

  const innerPromise = new Promise((resolve, reject) => {
    promise.resolve = resolve;
    promise.reject = reject;
  });

  promise.promise = innerPromise;

  return promise;
}
