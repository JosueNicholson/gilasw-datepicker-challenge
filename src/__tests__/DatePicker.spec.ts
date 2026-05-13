import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DatePicker from '@/components/DatePicker/DatePicker.vue'

describe('DatePicker component', () => {
  it('renders an input element', () => {
    const wrapper = mount(DatePicker)
    expect(wrapper.find('input').exists()).toBe(true)
  })

  it('popover is not visible initially', () => {
    const wrapper = mount(DatePicker)
    const popover = wrapper.find('[role="dialog"]')
    expect(popover.isVisible()).toBe(false)
  })

  it('popover becomes visible when input is clicked', async () => {
    const wrapper = mount(DatePicker, { attachTo: document.body })
    await wrapper.find('input').trigger('click')
    const popover = wrapper.find('[role="dialog"]')
    expect(popover.isVisible()).toBe(true)
    wrapper.unmount()
  })

  it('Enter key opens the popover', async () => {
    const wrapper = mount(DatePicker, { attachTo: document.body })
    await wrapper.find('input').trigger('keydown', { key: 'Enter' })
    expect(wrapper.find('[role="dialog"]').isVisible()).toBe(true)
    wrapper.unmount()
  })

  it('Space key opens the popover', async () => {
    const wrapper = mount(DatePicker, { attachTo: document.body })
    await wrapper.find('input').trigger('keydown', { key: ' ' })
    expect(wrapper.find('[role="dialog"]').isVisible()).toBe(true)
    wrapper.unmount()
  })

  it('popover closes when Escape key is pressed', async () => {
    const wrapper = mount(DatePicker, { attachTo: document.body })
    await wrapper.find('input').trigger('click')
    expect(wrapper.find('[role="dialog"]').isVisible()).toBe(true)
    await document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))

    await wrapper.vm.$nextTick()
    expect(wrapper.find('[role="dialog"]').isVisible()).toBe(false)
    wrapper.unmount()
  })

  it('clicking a date emits update:modelValue with ISO string', async () => {
    const wrapper = mount(DatePicker, {
      props: {
        modelValue: '',
        locale: 'en-US',
      },
      attachTo: document.body,
    })
    await wrapper.find('input').trigger('click')

    // Click the first current-month cell
    const cells = wrapper.findAll('[role="gridcell"]')
    const currentMonthCell = cells.find((c) => !c.classes('dp-cell--other-month'))
    expect(currentMonthCell).toBeDefined()
    await currentMonthCell!.trigger('click')

    const emitted = wrapper.emitted('update:modelValue')
    expect(emitted).toBeDefined()
    expect(emitted![0]![0]).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    wrapper.unmount()
  })

  it('popover closes after a date is selected', async () => {
    const wrapper = mount(DatePicker, { attachTo: document.body })
    await wrapper.find('input').trigger('click')
    expect(wrapper.find('[role="dialog"]').isVisible()).toBe(true)

    const cells = wrapper.findAll('[role="gridcell"]')
    const currentMonthCell = cells.find((c) => !c.classes('dp-cell--other-month'))
    await currentMonthCell!.trigger('click')

    await wrapper.vm.$nextTick()
    expect(wrapper.find('[role="dialog"]').isVisible()).toBe(false)
    wrapper.unmount()
  })

  it('clicking outside the component closes the popover', async () => {
    const wrapper = mount(DatePicker, { attachTo: document.body })
    await wrapper.find('input').trigger('click')
    expect(wrapper.find('[role="dialog"]').isVisible()).toBe(true)

    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[role="dialog"]').isVisible()).toBe(false)
    wrapper.unmount()
  })

  it('input displays placeholder when no date is selected', () => {
    const wrapper = mount(DatePicker, {
      props: { placeholder: 'Pick a date' },
    })
    expect(wrapper.find('input').attributes('placeholder')).toBe('Pick a date')
  })

  it('renders a 7-column weekday header', async () => {
    const wrapper = mount(DatePicker, { attachTo: document.body })
    await wrapper.find('input').trigger('click')
    const headers = wrapper.findAll('th')
    expect(headers).toHaveLength(7)
    expect(headers[0]!.text()).toBe('Mon')
    expect(headers[6]!.text()).toBe('Sun')
    wrapper.unmount()
  })
})
