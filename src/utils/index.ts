
export function testHello() {
  if (Math.random() > 0.5) throw new Error('test error')

  return { hello: 'hello' };
}

let val = Array(10).fill(testHello())
console.log('val', val)


console.log('999', 123) 