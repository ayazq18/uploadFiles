// src/store/auth.js
import axios from 'axios';
import { createStore } from 'vuex';

export default createStore({
  state: {
    user: null,
  },
  mutations: {
    SET_USER(state, user) {
      state.user = user;
    },
  },
  actions: {
    async fetchUser({ commit }) {
      const response = await axios.get('http://localhost:5000/auth/user');
      commit('SET_USER', response.data);
    },
    logout() {
      window.location.href = 'http://localhost:5000/auth/logout';
    },
  },
  getters: {
    isAuthenticated: (state) => !!state.user,
    user: (state) => state.user,
  },
});
