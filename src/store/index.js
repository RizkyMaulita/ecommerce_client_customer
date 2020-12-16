import Vue from 'vue'
import Vuex from 'vuex'
import axios from '../config/axiosinstance'
import router from '../router'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    products: [],
    isLogin: false,
    carts: [],
    histories: []
  },
  mutations: {
    setProducts (state, payload) {
      state.products = payload
    },
    checkLogin (state, payload) {
      state.isLogin = payload
    },
    setCarts (state, payload) {
      state.carts = payload
    },
    setHistories (state, payload) {
      state.histories = payload
    }
  },
  actions: {
    register (context, payload) {
      axios({
        method: 'POST',
        url: '/customer/register',
        data: payload
      })
        .then(({ data }) => {
          const name = data.email.split('@')[0]
          console.log(data)
          Vue.toasted.show(`Hi ${name} !`)
          Vue.toasted.show('Thank you for your first regist !!!')
          Vue.toasted.show("Let's login before your first transaction !!!")
          router.push('/login')
        })
        .catch(err => {
          console.log(err.response.data.message)
          if (err.response.data.messages) {
            err.response.data.messages.forEach((e) => {
              Vue.toasted.error(e.message)
            })
          } else if (err.response.data.message) {
            Vue.toasted.error(err.response.data.message)
          }
        })
    },
    login (context, payload) {
      axios({
        method: 'POST',
        url: '/customer/login',
        data: payload
      })
        .then(({ data }) => {
          console.log(data)
          localStorage.setItem('access_token', data.access_token)
          Vue.toasted.success(`Hi ${data.email.split('@')[0]} ! Have a nice day !!!`)
          router.push('/')
        })
        .catch(err => {
          // console.log(err.response.data.message)
          Vue.toasted.error(err.response.data.message)
        })
    },
    fetchData (context) {
      axios({
        method: 'GET',
        url: '/products'
      })
        .then(({ data }) => {
          context.commit('setProducts', data.result)
        })
        .catch(err => console.log(err))
    },
    addCart (context, payload) {
      axios({
        method: 'POST',
        url: '/carts/' + payload.productId,
        data: { quantity: payload.quantity },
        headers: {
          access_token: localStorage.getItem('access_token')
        }
      })
        .then(({ data }) => {
          console.log(data)
          context.dispatch('fetchCarts')
        })
        .catch(err => {
          console.log(err)
        })
    },
    fetchCarts (context) {
      axios({
        method: 'GET',
        url: '/carts',
        headers: {
          access_token: localStorage.getItem('access_token')
        }
      })
        .then(({ data }) => {
          context.commit('setCarts', data)
        })
        .catch(err => {
          console.log(err)
        })
    },
    deleteCart (context, id) {
      axios({
        method: 'DELETE',
        url: '/carts/' + id,
        headers: {
          access_token: localStorage.getItem('access_token')
        }
      })
        .then(_ => {
          context.dispatch('fetchCarts')
        })
        .catch(err => console.log(err))
    },
    checkout (context) {
      axios({
        method: 'PATCH',
        url: '/carts/checkout',
        headers: {
          access_token: localStorage.getItem('access_token')
        }
      })
        .then(({ data }) => {
          console.log(data)
          context.dispatch('fetchCarts')
        })
        .catch(err => console.log(err))
    },
    fetchHistories (context) {
      axios({
        method: 'GET',
        url: '/carts/histories',
        headers: {
          access_token: localStorage.getItem('access_token')
        }
      })
        .then(({ data }) => {
          console.log(data)
          context.commit('setHistories', data)
        })
        .catch(err => console.log(err))
    }
  },
  getters: {
    getCart (state) {
      return state.carts.filter(e => !e.totalPrice)
    },
    totalPrice (state) {
      return state.carts.filter(e => e.totalPrice)
    }
  },
  modules: {
  }
})
