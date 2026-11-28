const { request } = require('../../api')

Page({
  data: {
    services: [],
    slots: [],
    service: null,
    slot: null,
    booking: null,
    loading: false,
    submitting: false,
    refreshing: false,
    error: ''
  },

  onLoad() {
    this.setData({ booking: wx.getStorageSync('latestBooking') || null })
    this.loadOptions()
    if (this.data.booking) this.refreshBooking()
  },

  async loadOptions() {
    if (this.data.loading || this.data.submitting) return
    this.setData({ loading: true, error: '' })
    try {
      const [services, slots] = await Promise.all([request('/services'), request('/slots')])
      const service = services.find(item => item.id === this.data.service?.id) || null
      const slot = slots.find(item => item.id === this.data.slot?.id) || null
      this.setData({ services, slots, service, slot })
    } catch (error) {
      this.setData({ error: error.message })
    } finally {
      this.setData({ loading: false })
    }
  },

  chooseService(event) {
    this.setData({ service: this.data.services[Number(event.detail.value)] })
  },

  chooseSlot(event) {
    this.setData({ slot: this.data.slots[Number(event.detail.value)] })
  },

  async submitBooking() {
    const { service, slot, loading, submitting } = this.data
    if (!service || !slot || loading || submitting) return
    this.setData({ submitting: true, error: '' })
    try {
      const booking = await request('/bookings', 'POST', {
        serviceId: service.id,
        slotId: slot.id
      })
      this.setData({ booking, slot: null, slots: this.data.slots.filter(item => item.id !== slot.id) })
      wx.setStorageSync('latestBooking', booking)
    } catch (error) {
      if (error.status === 409) {
        this.setData({ slot: null, slots: this.data.slots.filter(item => item.id !== slot.id) })
      }
      this.setData({ error: error.message })
    } finally {
      this.setData({ submitting: false })
    }
  },

  async refreshBooking() {
    const { booking, refreshing } = this.data
    if (!booking || refreshing) return
    this.setData({ refreshing: true, error: '' })
    try {
      const updatedBooking = await request('/bookings/' + booking.id)
      if (this.data.booking.id !== booking.id) return
      this.setData({ booking: updatedBooking })
      wx.setStorageSync('latestBooking', updatedBooking)
    } catch (error) {
      if (this.data.booking.id !== booking.id) return
      this.setData({ error: error.message })
      if (error.status === 404) {
        this.setData({ booking: null })
        wx.removeStorageSync('latestBooking')
      }
    } finally {
      this.setData({ refreshing: false })
    }
  }
})
