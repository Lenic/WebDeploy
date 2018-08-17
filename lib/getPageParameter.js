export default function getPageParameter(key) {
  const url = location.href
    , name = key.replace(/[\[\]]/g, '\\$&')
    , regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)')
    , results = regex.exec(url);

  if (!results) {
    return null;
  }

  if (!results[2]) {
    return '';
  }

  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
