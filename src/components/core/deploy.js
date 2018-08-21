import Deferred from '$lib/deferred';

export default function (parameter) {
  const defer = Deferred()
    , opts = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parameter),
    };

  fetch('http://t.helianshare.com:8005/api/v1/build', opts).then(
    res => {
      if (res.ok) {
        res.json().then(v => defer.resolve(v.id));
      } else if (res.status >= 400 && res.status <= 500) {
        defer.reject('参数传递错误！');
      } else {
        defer.reject('服务器异常！');
      }
    },
    () => defer.reject('服务器异常！'),
  );

  return defer.promise;
}
