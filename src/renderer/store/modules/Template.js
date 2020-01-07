import Vue from 'vue'

const state = {
  groups: [],
  templates: []
}

const mutations = {
  CREATE_GROUP (state, {group}) {
    state.groups.push(group)
  },
  SET_GROUP (state, {index, group}) {
    Vue.set(state.groups, index, {...group})
  },
  DELETE_GROUP (state, {group}) {
    const index = state.groups.findIndex(g => g.id === group.id)
    if (index !== -1) {
      state.groups.splice(index, 1)
    }
    state.templates = state.templates.filter(t => t.groupId !== group.id)
  },
  CREATE_TEMPLATE (state, {template}) {
    state.templates.push(template)
  },
  SET_TEMPLATE (state, {template}) {
    const index = state.templates.findIndex(t => t.id === template.id)
    if (index !== -1) {
      Vue.set(state.templates, index, {...template})
    }
  },
  DELETE_TEMPLATE (state, {template}) {
    const index = state.templates.findIndex(t => t.id === template.id)
    if (index !== -1) {
      state.templates.splice(index, 1)
    }
  }
}

const actions = {
  loadConnections ({ commit }) {
    const connections = []
    commit('SET_CONNECTIONS', {connections})
  }
}

export default {
  state,
  mutations,
  actions
}
