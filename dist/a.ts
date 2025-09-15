
function gen_type(t, k) {
}
function GenApi(t, k) { }


@GenApi
export class UserApi3 {

  @gen_type
  static getWeather(): Promise<Response_UserApi3_getWeather> {
    return fetch('http://t.weather.sojson.com/api/weather/city/101030100').then(r => r.json()) as any
  }
}

