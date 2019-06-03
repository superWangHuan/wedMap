import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)
const store=new Vuex.Store({
    state:{
        addPeople:[]
    },
    mutations:{
        setPeople(state,value){
            state.addPeople=value
        }
    },
    getters:{
        addPeople(state){
            return state.addPeople
        }
    }
})
export default store