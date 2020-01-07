import Vue from 'vue'

const state = {
  connections: []
}

const mutations = {
  SET_CONNECTIONS (state, {connections}) {
    state.connections = connections
  },
  SET_CONNECTION (state, {connection, index}) {
    Vue.set(state.connections, index, connection)
  },
  CREATE_CONNECTION (state, connection) {
    state.connections.push(connection)
  },
  DELETE_CONNECTION (state, {index}) {
    state.connections.splice(index, 1)
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
