const { request } = require('./api')

function call(path, method, data, token) {
  return request('/operations' + path, method, data, token)
}

let pendingSession
function customerToken() {
  const token = wx.getStorageSync('salonDemoSession')
  if (token) return Promise.resolve(token)
  if (!pendingSession) {
    pendingSession = call('/session', 'POST').then(result => {
      wx.setStorageSync('salonDemoSession', result.token)
      return result.token
    }).finally(() => { pendingSession = null })
  }
  return pendingSession
}

function customer(path, method, data) {
  return customerToken().then(token => call(path, method, data, token))
}

function showError(page, error) {
  page.setData({ error: error.message || '操作失败，请重试' })
}

const labels = {
  pending: '待店员响应', accepted: '店员已接单', declined: '店员无法承接',
  awaiting_customer: '待顾客确认', completed: '已完成并扣次'
}
const bookingsWithLabels = bookings => bookings.map(booking => ({
  ...booking, statusLabel: labels[booking.status]
}))
const withPrices = items => items.map(item => ({ ...item, price: (item.priceCents / 100).toFixed(2) }))

module.exports = { call, customer, showError, bookingsWithLabels, withPrices }
