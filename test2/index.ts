
//// <reference path="./types.d.ts" />



import { gen_type } from "../src";
import { GenApi } from "../src/decotators";


const asleep = (t = 1000) => new Promise(r => setTimeout(r, t))
const year = 2025
@GenApi()
export class UserApi2 {
  @gen_type({ typeName: "XXXJP", args: [2010, 2045] })

  static getUser(year: number) {
    return fetch(`http://localhost:8081/goviewTestData?year=${year}`).then(r => r.json()) as any
  }



  @gen_type()
  static async getList() {

    return asleep(1000).then(() => {
      // return ({ name: "zs" })
      // return testHello()
      throw new Error("test error")
    })
  }

  @gen_type({ typeName: 'XXX' })
  static getWeather(): Promise<XXX> {
    return fetch('http://t.weather.sojson.com/api/weather/city/101030100').then(r => r.json()) as any
  }
}

// UserApi.getWeather().then((r) => {
//   // console.log('r', r)
//   r.data.forecast[0]


