const { call, withPrices, showError } = require('../../operations')

Page({
  data: { projects: [], campaigns: [], buyer: false, error: '' },
  async onShow() {
    this.setData({ error: '' })
    try {
      const { projects, campaigns, buyer } = await call('/catalog', 'GET', null, wx.getStorageSync('salonDemoSession'))
      this.setData({ projects: withPrices(projects), campaigns: withPrices(campaigns), buyer })
    } catch (error) { showError(this, error) }
  }
})
