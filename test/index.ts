
//// <reference path="./types.d.ts" />



import { gen_type } from "../src";


const asleep = (t = 1000) => new Promise(r => setTimeout(r, t))
const year = 2025
export class UserApi {

  @gen_type({ args: [year], typeName: 'AAAA' })
  static getUser(year: number) {
    return fetch(`http://localhost:8081/goviewTestData?year=${year}`).then(r => r.json()) as any
  }

  // @gen_type2()
  static async getList() {

    return asleep(1000).then(() => {
      return ({ name: "zs" })
    })
  }

  @gen_type()
  static getWeather(): Promise<Response_UserApi_getWeather> {
    return fetch('http://t.weather.sojson.com/api/weather/city/101030100').then(r => r.json()) as any
  }
}

// UserApi.getWeather().then((r) => {
//   // console.log('r', r)
//   r.data.forecast[0]


