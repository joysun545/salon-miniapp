const { customer, showError } = require('../../operations')

Page({
  data: { project: null, campaign: null, price: '', busy: false, order: null, error: '' },
  async onLoad(options) {
    try {
      const { projects, campaigns } = await customer('/catalog')
      const project = projects.find(item => item.id === options.project)
      const campaign = campaigns.find(item => item.id === options.campaign && item.projectId === options.project)
      if (!project || (options.campaign && !campaign)) throw new Error('项目或活动已失效')
      this.setData({ project, campaign, price: ((campaign?.priceCents ?? project.priceCents) / 100).toFixed(2) })
    } catch (error) { showError(this, error) }
  },
  async pay() {
    if (this.data.busy) return
    this.setData({ busy: true, error: '' })
    try {
      const { project, campaign } = this.data
      const order = this.data.order || await customer('/orders', 'POST', {
        projectId: project.id, campaignId: campaign?.id
      })
      this.setData({ order })
      const price = (order.priceCents / 100).toFixed(2)
      if (price !== this.data.price) {
        this.setData({ price })
        throw new Error('订单金额已更新，请重新确认')
      }
      await customer('/orders/' + order.id + '/demo-pay', 'POST')
      wx.redirectTo({ url: '/pages/customer/index' })
    } catch (error) { showError(this, error) }
    finally { this.setData({ busy: false }) }
  }
})
