

const val = import('file:///D:\\demo\\gen-api-types-2\\dist\\a.ts')
val.then(r => {

  console.log('r',r)
  r.default.A_Api.getWeather().then(console.log)
})