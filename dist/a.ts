

function gen_type() {
}
function GenApi() { }


@GenApi
export class A_Api {

  @gen_type
  static getWeather(): Promise<Response_UserApi2_getWeather> {
    return fetch('http://t.weather.sojson.com/api/weather/city/101030100').then(r => r.json()) as any
  }
}