<template>
    <div>
        <div class="container">
            <!--to do-->
            <div class="city-box">
                <div class="location" :data-city="city" @click="getPages"><div>当前位置：</div><div class="current">{{city}}</div></div>
                <div class="fill"></div>
                <div class="scroll-box">
                    <scroll-view scroll-y class="city_list" :scroll-into-view="showwords">
                        <div v-for="(letter,l_sub) in cityData" :key="l_sub">
                            <div :id="letter.char"><text class="list_tit">{{letter.char}}</text></div>
                            <div v-for="(city,city_sub) in letter.list" :key="city_sub">
                                <div class="list_con" :data-city="city.name" @click="getPages"><text>{{city.name}}</text></div>
                            </div>
                        </div>
                    </scroll-view>            
                </div>

                <div class="letter-box" @touchstart="chStart" @touchend="chEnd" @touchmove="chMove">
                    <div v-for="(item,index) in cityarr" :key="index">
                        <div class="letter-list" :data-id="item" @touchstart="getWords" @touchend="setWords">{{item}}</div>
                    </div>
                </div>
                <div class="showwords" v-if="hidden">
                    {{showwords}}
                </div>
            </div>

        </div>
    </div>
</template>
<script>
import { getSign, api_url } from '../../utils/getData.js'
import { wed_url } from '../../utils/wed_url.js'
import store from '../../store/store.js'
var lineHeight = 0;
var endWords = "";
var isNum;
export default {
    data(){
        return{
            city: "",
            scrollTopId: "",
            type: {
                type: "group",
            },
            cityData: [],
            cityarr: ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "L", "M", "N", "P", "Q", "R", "S", "T", "W", "X", "Y", "Z"],
            hidden: false,
            trans: "",
            showwords: "",
            bite:false,
            sid:''
        }
    },
    methods:{
        getPages: function (e) {
            let area = e.currentTarget.dataset.city;
            store.commit('setArea',area);
            store.commit('setMap',false)
            swan.navigateBack({})
        },
        chStart: function () {
            this.trans='.3';
            this.hidden=true;
        },
        chEnd: function () {
            this.trans='0';
            this.hidden=false;
            this.scrollTopId=this.endWords;
        },
        setWords: function (e) {
            let id = e.currentTarget.dataset.id;
            this.showwords=endWords;
        },
        getWords: function (e) {
            let id = e.currentTarget.dataset.id;
            endWords = id;
            isNum = id;
            this.showwords=id;
        },
        chMove: function (e) {
            let y = e.clientY;
            let offsettop = e.currentTarget.offsetTop;
            let height = 0;
            let cityarr = this.cityarr;       
            swan.getSystemInfo({
                success:  (res)=>{
                    height = res.windowHeight - 10
                    if (y > offsettop && y < height) {
                        let num = parseInt((y - offsettop) / lineHeight);
                        endWords = cityarr[num];
                        this.endWords = endWords;
                    if (isNum != num) {
                        isNum = num;
                        this.showwords=this.endWords;
                        swan.vibrateShort({})
                    }
                }
            }
            })
        },
        getLocation: function () {
            swan.getLocation({
                success: (res) => {
                    this.city=res.city;
                }
            })
        },
        getCityList: function () {
            swan.showLoading({
                title:'加载中...',
            })
            let param={type:"group"}
            let sid=this.sid;
            param = getSign(param, sid)
            swan.request({
                url: wed_url.z_url+'?s=area/procity',
                method: "POST",
                dataType: "json",
                data: param,
                header:{"content-type": "application/json" },
                success: (res) => {
                    this.sid=res.data.sid;
                    this.cityData=res.data.data;
                    swan.hideLoading()
                }
            });
        },
    },
    onLoad(options){
        this.sid=options.sid
    },
    mounted(){ 
        this.getCityList();
        this.getLocation();          
        swan.getSystemInfo({
            success: (res)=>{
                lineHeight = (res.windowHeight - 100) / 22;
                this.winHeight=res.windowHeight - 40;
                this.lineHeight=lineHeight;
            }
        })        
    }
}
</script>
<style scoped>
    @import url('./index.css');
</style>
