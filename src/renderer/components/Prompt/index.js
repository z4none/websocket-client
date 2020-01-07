import Prompt from './Prompt'

const component = {
  install (Vue, options) {
    Vue.prototype.$prompt = (propsData) => {
      const ComponentClass = Vue.extend(Prompt)
      const instance = new ComponentClass({propsData})
      instance.$mount()
      document.appendChild(instance.$el)
      return instance.show()
    }
  }
}

export default component
