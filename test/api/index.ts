



import { gen_type_c, gen_type_m } from "../../src";

const asleep = (t = 1000) => new Promise(r => setTimeout(r, t))
@gen_type_c()
export class SampleApi {


  // @gen_type_m({ args: [2027] })
  static getUser(year: number) {
    return fetch(`http://localhost:8081/goviewTestData?year=${year}`).then(r => r.json())
  }

  @gen_type_m({ args: ['1000'], typeName: "XXX" })
  static async getList(id: number) {

    return asleep(1000).then(() => {
      return ({ name: "zs", id })
    })
  }

  @gen_type_m()
  static getWeather() {
    return fetch('http://t.weather.sojson.com/api/weather/city/101030100').then(r => r.json())
  }
}