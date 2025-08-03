import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import RichTextEditor from '../components/RichTextEditor.vue'

describe('RichTextEditor.vue', () => {
  it('renders initial modelValue', () => {
    const wrapper = mount(RichTextEditor, {
      props: { modelValue: '<p>Hello World</p>' },
    })
    expect(wrapper.find('[contenteditable="true"]').element.innerHTML).toBe('<p>Hello World</p>')
  })

  it('emits update:modelValue on input', async () => {
    const wrapper = mount(RichTextEditor, {
      props: { modelValue: '' },
    })
    const editor = wrapper.find('[contenteditable="true"]')
    await editor.trigger('input')
    expect(wrapper.emitted()['update:modelValue']).toBeTruthy()
  })

  it('updates content when modelValue changes', async () => {
    const wrapper = mount(RichTextEditor, {
      props: { modelValue: '<p>Initial</p>' },
    })
    await wrapper.setProps({ modelValue: '<p>Updated</p>' })
    expect(wrapper.find('[contenteditable="true"]').element.innerHTML).toBe('<p>Updated</p>')
  })

  it('calls execCmd for bold, italic, and list', async () => {
    document.execCommand = vi.fn()
    const wrapper = mount(RichTextEditor)

    await wrapper.find('button[title="Fett"]').trigger('click')
    expect(document.execCommand).toHaveBeenCalledWith('bold', false, null)

    await wrapper.find('button[title="Kursiv"]').trigger('click')
    expect(document.execCommand).toHaveBeenCalledWith('italic', false, null)

    await wrapper.find('button[title="Liste"]').trigger('click')
    expect(document.execCommand).toHaveBeenCalledWith('insertUnorderedList', false, null)
  })

  it('calls execCmd for creating a link', async () => {
    window.prompt = vi.fn().mockReturnValue('https://example.com')
    document.execCommand = vi.fn()
    const wrapper = mount(RichTextEditor)

    await wrapper.find('button[title="Link einfügen"]').trigger('click')

    expect(window.prompt).toHaveBeenCalledWith('Bitte geben Sie die URL ein:', 'https://')
    expect(document.execCommand).toHaveBeenCalledWith('createLink', false, 'https://example.com')
  })
})
