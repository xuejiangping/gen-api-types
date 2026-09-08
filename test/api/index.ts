
import { gen_type_c, gen_type_m } from "gen-api-types";

const asleep = (t = 1000) => new Promise(r => setTimeout(r, t))
const aa = '99'
@gen_type_c()
export class SampleApi {
  @gen_type_m({
    args: [aa],
    typeName: "GetListResult"
  })
  static async getList(id: number) {

    return asleep(1000).then(() => {
      return ({ name: "zs", id })
    })
  }

  @gen_type_m()
  getWeather(): Promise<Response_SampleApi_getWeather> {
    return fetch('http://t.weather.sojson.com/api/weather/city/101030100').then(r => r.json())
  }
}

// console.log('加载 test/api/index.ts')