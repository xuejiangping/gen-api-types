



import { gen_type_c, gen_type_m } from "../../src";
import { Response_SampleApi_getWeather } from "../output";

const asleep = (t = 1000) => new Promise(r => setTimeout(r, t))
@gen_type_c()
export class SampleApi {



  @gen_type_m({ args: ['1000'], typeName: "GetListResult2" })
  static async getList2(id: number) {

    return asleep(1000).then(() => {
      return ({ name: "zs", id })
    })
  }

  @gen_type_m()
  getWeather2(): Promise<Response_SampleApi_getWeather> {
    return fetch('http://t.weather.sojson.com/api/weather/city/101030100').then(r => r.json())
  }
}

console.log('加载 test/api/index2.ts')