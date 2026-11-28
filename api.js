const baseUrl = 'https://joytest.site/salon/api'

function request(path, method = 'GET', data, token) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: baseUrl + path,
      method,
      data,
      timeout: 8000,
      header: token ? { Authorization: 'Bearer ' + token } : {},
      success(result) {
        if (result.statusCode >= 200 && result.statusCode < 300) {
          resolve(result.data)
          return
        }
        const error = new Error(result.data?.message || '请求失败，请稍后重试')
        error.status = result.statusCode
        reject(error)
      },
      fail() {
        reject(new Error('无法连接预约服务，请检查网络后重试'))
      }
    })
  })
}

module.exports = { request }
