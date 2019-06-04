<template>
    <div>
        <div class="container">
            <!--to do-->
            <div class="outer">
                <div class="outer-box">
                    <!-- 地图 -->
                    <div :class="[isShow?'map-box':'max-map-box']">
                        <map id="map" :data-tag="'map'" :include-points="arr" class="map" scale="10" :markers="markers" @click="hide" :show-location="isLocation"  v-if="ismap">
                            <!-- 城市按钮 -->
                            <cover-view class="city-btn" @click="cityList">
                                <cover-view class="city">{{myCity||no_add}}</cover-view>
                                <cover-view class="below">
                                    <cover-image :src="img_url+'wedTools/pic/regist/sanjiao@2x.png'"></cover-image>
                                </cover-view>
                            </cover-view>
                            <cover-view class="feedback-btn" @click="navFeedback">
                                <cover-view class="feedback-txt">
                                    反馈
                                </cover-view>
                            </cover-view>
                        </map>
                    </div>
                    <!-- 登记处列表 -->
                    <div :class="['address',isShow?'address-list':'hidden-list']">
                        <scroll-view class="address-scroll" scroll-y>
                            <div class="list-box">
                                <block v-for="(item,index) in regList" :key="index">
                                    <div :class="[isShow?'address-item':'hidden-item']">
                                        <div class="inner-item">
                                            <div class="item-left">
                                                <div class="registry">
                                                    <text>{{item.registry_name}}</text>
                                                </div>
                                                <div class="reg-address">
                                                    <text>{{item.registry_location}}</text>
                                                </div>
                                                <div class="work-day">
                                                    <text>{{item.work_time||str}}</text>
                                                </div>
                                            </div>
                                            <div class="item-right">
                                                <div class="nav-icon" @click="arrive" :data-coordinate="item.baidumap">
                                                    <image :src="img_url+'wedTools/pic/regist/weizhi@3x.png'"></image>
                                                </div>
                                                <div class="phone-icon" @click="dial" :data-phone="item.telephone">
                                                    <image :src="img_url+'wedTools/pic/regist/dianhua@2x.png'"></image>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </block>
                            </div>
                        </scroll-view>
                    </div>

                    <div :class="['btn',isShow?'hide-address-btn':'show-address-btn']" @click="show">
                        <div class="city-count">
                            <text>{{myCity||no_add}}</text>
                            <text>共有</text>
                            <text class="extrude">{{regList.length}}</text><text>民政局</text>
                        </div>
                    </div>

                </div>
            </div>
        </div>      
    </div>
</template>
<script>
import { getSign, api_url } from '../../utils/getData.js'
import { wed_url } from '../../utils/wed_url.js'
import store from '../../store/store.js'
let myLocation="";
export default {
    data(){
        return{
            city: {},
            city_id: '',
            isShow: true,
            latitude: "",
            longitude: "",
            myCity: "",
            no_add:"该地区",
            regList: [],
            markers: [],
            ismap: false,
            arr: [],
            str:"周一至周五上班，法定节假日除外。期间办公时间为上午8：30-11：30 下午13：30-17：00",
            oCity:"",
            isLocation:true,
            sid:"",
            img_url:wed_url.img_url,
        }
    },
    methods:{
        navFeedback:function(){
            swan.navigateTo({
                url:'../feedback/main?sid='+this.sid
            })
        },
        areaSelection: function () {
            let sid=this.sid;
            this.myCity=store.getters.area;
            this.ismap=store.getters.ismap;
            let myCity = this.myCity
            let oCity=this.oCity;
            if(myLocation==myCity || myCity==""){
                this.isLocation=true;
            }else{
                this.isLocation=false;      
            }
            if (myCity !== "" && myCity !== oCity) {
                let city = this.city;
                city.address = myCity;
                city = getSign(city, sid)
                this.city=city;
                this.getCity()            
            }else{
                this.moveToLocation()
            }
        },
        dial: function (e) {
            let phone = e.currentTarget.dataset.phone;
            let phones = phone.split(" ")
            swan.makePhoneCall({
                phoneNumber: phones[0] 
            });
        },
        arrive: function (e) {
            let coor = e.currentTarget.dataset.coordinate;
            let coors = coor.split(",")
            swan.openLocation({
                latitude: Number(coors[1]),
                longitude: Number(coors[0]),
                scale: 12,
                success:function(){},
                fail:function(){
                    swan.showToast({
                        title:"暂无数据",
                        icon:"none",
                        duration: 1000,
                    })
                },
            })
        },
        moveToLocation: function () {//获取当前城市信息
            swan.authorize({
                scope: 'scope.userLocation',
                success: (res)=>{
                    swan.getLocation({
                        type: 'gcj02',
                        success: (res) => {
                            myLocation=res.city;
                            this.myCity=res.city;
                            this.oCity=res.city;
                            this.getCity()
                        },
                        complete: function () {
                            
                        }
                    });
                },
                fail: function () {}
            });
        },
        getCity: function () {//获取当前城市信息
            swan.showLoading({
                title:'加载中...'
            })
            let city=this.myCity;
            let sid=this.sid;
            let param={address:city};
            param=getSign(param,sid);
            swan.request({
                url: wed_url.z_url+'?s=area/searchcity',
                dataType: 'json',
                data: param,
                header:{"content-type": "application/json" },
                method: 'POST',
                success: (res) => {
                    this.sid=res.data.sid;
                    this.city_id=res.data.data.city_id;
                    this.getReg()
                },
                complete: function () {
                    
                }
            })
        },
        getReg: function () {//获取登记处信息
            let sid=this.sid;
            let city_id=this.city_id;
            let bd_tx=0;
            let param={city_id,bd_tx,sid};
            param=getSign(param,sid);
            swan.request({
                url: wed_url.dc_url+'RegisterLists',
                dataType: 'json',
                header:{"content-type": "application/json;" },
                method: 'GET',            
                data: param,
                success: (res) => {
                    this.sid=res.data.sid;
                    if(res.data.data.length==0){
                        swan.showToast({
                            title:"没有相关内容",
                            icon:"none"
                        })
                    };
                    this.regList=res.data.data;
                    this.getMarkers();
                },
                complete: function () {
                
                }
            })
        },
        getMarkers: function () {
            let markers = [];
            let arr = this.regList;
            for (let key in arr) {
                let str = arr[key].baidumap;
                let baidumap = str.split(",");
                let item = {
                    markerId: parseInt(key),
                    iconPath:'/static/images/markers_icon.png',
                    callout: {
                        fontSize: 12,
                        content: arr[key].registry_name,
                        display: "BYCLICK",
                    },
                    width: 13,
                    height: 17,
                    longitude: Number(baidumap[0]),
                    latitude: Number(baidumap[1]),
                }
                markers.push(item)
            }
            this.markers=markers;
            this.ismap=true;
            let copyArr = [];
            for (let i in markers) {
                let coor = {
                    latitude: markers[i].latitude,
                    longitude: markers[i].longitude,
                }
                copyArr.push(coor)
            };
            this.arr=copyArr;
            this.includePoints();
            swan.hideLoading();
        },
        includePoints:function(){
            let arr=this.arr;
            this.mapContext.includePoints({
                points:arr,
                padding:[10],
            })  
        },     
        hide: function () { //show=false
            this.isShow=false;
        },
        show: function () { //show=true
            this.isShow=true;
        },
        cityList: function () {
            swan.navigateTo({
                url: '../cityList/main?sid='+this.sid
            });
        },   
    },
    onLoad(options){
        if(options.sid){
            this.sid=sid;
        }
    },
    mounted(){
        this.mapContext = swan.createMapContext("map");
        // this.moveToLocation();
        let arr = this.markers    
        this.areaSelection()    
    },
    onShow: function () {
        // 监听页面显示的生命周期函数
            let myCity=this.myCity;
            let area=store.getters.area;
            if(area!=myCity&&area!=''){
              this.areaSelection()  
            }
           
        
    },
}
</script>
<style scoped>
@import url('./index.css');
</style>
