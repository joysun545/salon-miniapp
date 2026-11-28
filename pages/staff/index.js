const { call, showError, bookingsWithLabels } = require('../../operations')

Page({
  data: { token: '', verified: false, bookings: [], schedules: [], error: '', busy: false },
  inputToken(event) { this.setData({ token: event.detail.value, verified: false }) },
  async refresh() {
    try {
      const { bookings, schedules } = await call('/staff', 'GET', null, this.data.token)
      this.setData({ bookings: bookingsWithLabels(bookings), schedules, error: '', verified: true })
    } catch (error) { this.setData({ verified: false }); showError(this, error) }
  },
  async act(event) {
    if (this.data.busy) return
    const { id, action } = event.currentTarget.dataset
    this.setData({ busy: true, error: '' })
    try {
      await call('/bookings/' + id + '/' + action, 'POST', null, this.data.token)
      await this.refresh()
    } catch (error) { showError(this, error) }
    finally { this.setData({ busy: false }) }
  }
})
