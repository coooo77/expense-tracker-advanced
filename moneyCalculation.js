function moneyCalculation(list) {
  let sum = 0
  list.forEach(record => {
    sum += record.amount
  })
  return sum
}

// console.log(moneyCalculation(list))
module.exports = moneyCalculation