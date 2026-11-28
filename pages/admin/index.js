const { call, showError, bookingsWithLabels, withPrices } = require('../../operations')

const blankProject = { name: '', description: '', duration: '', price: '', visits: '1' }
function cents(value) {
  if (!/^\d+(\.\d{1,2})?$/.test(value || '')) return 0
  return Math.round(Number(value) * 100)
}

Page({
  data: {
    token: '', verified: false, busy: false, error: '', message: '',
    projects: [], campaigns: [], bookings: [], schedules: [],
    project: blankProject, campaign: {}, schedule: {}, audience: 'visitor'
  },
  inputToken(event) { this.setData({ token: event.detail.value, verified: false }) },
  async refresh() {
    try {
      const { projects, campaigns, bookings, schedules } = await call('/admin', 'GET', null, this.data.token)
      this.setData({ projects: withPrices(projects), campaigns: withPrices(campaigns),
        bookings: bookingsWithLabels(bookings), schedules, verified: true, error: '' })
    } catch (error) { this.setData({ verified: false }); showError(this, error) }
  },
  edit(event) {
    const { id } = event.currentTarget.dataset
    this.setData({ project: this.data.projects.find(item => item.id === id) || blankProject })
  },
  field(event) {
    const { field } = event.currentTarget.dataset
    this.setData({ [field]: event.detail.value })
  },
  pickProject(event) {
    const project = this.data.projects[Number(event.detail.value)]
    this.setData({ 'campaign.projectId': project.id, 'campaign.projectName': project.name })
  },
  pickAudience(event) {
    this.setData({ audience: event.detail.value === '0' ? 'visitor' : 'customer' })
  },
  async save(event) {
    if (this.data.busy) return
    const kind = event.currentTarget.dataset.kind
    const { project, campaign, audience, schedule, token } = this.data
    const payloads = {
      projects: { ...project, duration: Number(project.duration), priceCents: cents(project.price), visits: Number(project.visits) },
      campaigns: { ...campaign, audience, priceCents: cents(campaign.price),
        endsAt: campaign.date ? campaign.date + 'T23:59:59+08:00' : '' },
      schedules: {
        start: schedule.date && schedule.start ? schedule.date + 'T' + schedule.start + ':00+08:00' : '',
        end: schedule.date && schedule.end ? schedule.date + 'T' + schedule.end + ':00+08:00' : ''
      }
    }
    this.setData({ busy: true, error: '', message: '' })
    try {
      await call('/admin/' + kind, 'POST', payloads[kind], token)
      this.setData({ message: '已保存' })
      await this.refresh()
    } catch (error) { showError(this, error) }
    finally { this.setData({ busy: false }) }
  }
})
