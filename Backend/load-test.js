import http from 'k6/http';

export let options = {
  vus: 200,
  duration: '30s',
};

export default function () {
  http.get('https://developerconnect-nsvf.onrender.com/load-test');
}