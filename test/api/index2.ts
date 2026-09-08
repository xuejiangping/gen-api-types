
import { GatDecorator } from "gen-api-types";

const asleep = (t = 1000) => new Promise(r => setTimeout(r, t))
const aa = 123
@GatDecorator.gen_type_c()
export class SampleApi2 {
  @GatDecorator.gen_type_m({ args: [aa], typeName: "GetListResult2" })
  static async getList2(id: number) {

    return asleep(1000).then(() => {
      return ({ name: "zs", id })
    })
  }

  @GatDecorator.gen_type_m()
  getWeather2(): Promise<Response_SampleApi_getWeather> {
    return fetch('http://t.weather.sojson.com/api/weather/city/101030100').then(r => r.json())
  }
}

console.log('加载 test/api/index2.ts')