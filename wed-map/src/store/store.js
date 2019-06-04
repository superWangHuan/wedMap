import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)
const store=new Vuex.Store({
    state:{
        area:'',
        ismap:null,
    },
    mutations:{
        setArea(state,newValue){
            state.area=newValue
        },
        setMap(state,newValue){
            state.ismap=newValue
        }
    },
    getters:{
        area(state){
            return state.area
        },
        ismap(state){
            return state.ismap
        }
    }
})
export default store