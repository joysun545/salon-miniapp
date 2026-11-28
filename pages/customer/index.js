const { customer, showError, bookingsWithLabels } = require('../../operations')

Page({
  data: { orders: [], bookings: [], slots: [], slot: null, active: '', busy: false, error: '' },
  onShow() { this.refresh() },
  async refresh() {
    try {
      const { orders, bookings } = await customer('/account')
      this.setData({ orders: orders.filter(order => order.status === 'paid'), bookings: bookingsWithLabels(bookings) })
    } catch (error) { showError(this, error) }
  },
  async openSlots(event) {
    if (this.data.busy) return
    const active = event.currentTarget.dataset.id
    this.setData({ active, slot: null, slots: [], busy: true, error: '' })
    try { this.setData({ slots: await customer('/orders/' + active + '/slots') }) }
    catch (error) { showError(this, error) }
    finally { this.setData({ busy: false }) }
  },
  selectSlot(event) { this.setData({ slot: this.data.slots[Number(event.detail.value)] }) },
  async act(event) {
    if (this.data.busy) return
    const id = event.currentTarget.dataset.id
    this.setData({ busy: true, error: '' })
    try {
      if (id) await customer('/bookings/' + id + '/confirm', 'POST')
      else {
        await customer('/orders/' + this.data.active + '/book', 'POST', { start: this.data.slot.start })
        this.setData({ active: '', slot: null, slots: [] })
      }
      await this.refresh()
    } catch (error) { showError(this, error) }
    finally { this.setData({ busy: false }) }
  }
})
