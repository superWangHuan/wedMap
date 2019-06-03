<template>
    <div>
        <div class="container">
            <!--to do-->
            <div class="outer">
                <div class="outer-box">
                    <!-- 地图 -->
                    <div :class="[isShow?'map-box':'max-map-box']">
                        <map id="map" :data-tag="'map'" :include-points="arr" class="map" scale="10" :markers="markers" @click="hide" v-if="map" :show-location="isLocation">
                            <!-- 城市按钮
                            <cover-view class="city-btn" @click="cityList">
                                <cover-view class="city">{{myCity||no_add}}</cover-view>
                                <cover-view class="below">
                                    <cover-image src="../../static/images/below-icon.png"></cover-image>
                                </cover-view>
                            </cover-view> -->
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
                                                    <image src="../../static/images/markers_icon.png"></image>
                                                </div>
                                                <div class="phone-icon" @click="dial" :data-phone="item.telephone">
                                                    <image src="../../static/images/phone-icon.png"></image>
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
import { getSign } from '../../utils/getData.js'
import { wed_url } from '../../utils/wed_url.js'
let myLocation=""
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
            map: false,
            arr: [],
            str:"周一至周五上班，法定节假日除外。期间办公时间为上午8：30-11：30 下午13：30-17：00",
            oCity:"",
            isLocation:true,
            sid:"",
        }
    },
    methods:{
        areaSelection: function () {
            console.log(myLocation)
            var myCity = this.myCity
            var oCity=this.oCity;
            if(myLocation==myCity || myCity==""){
                this.isLocation=true;
            }else{
                this.isLocation=false;      
            }
            if (myCity !== "" && myCity !== oCity) {
                var city = this.city;
                city.address = myCity;
                city = getSign(city, sid)
                this.city=city;
                this.getCity()            
            }else{
                this.moveToLocation()
            }
        },
        dial: function (e) {
            var phone = e.currentTarget.dataset.phone;
            var phones = phone.split(" ")
            swan.makePhoneCall({
                phoneNumber: phones[0] 
            });
        },
        arrive: function (e) {
            var coor = e.currentTarget.dataset.coordinate;
            var coors = coor.split(",")
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
                    console.log(res)
                    swan.getLocation({
                        type: 'gcj02',
                        success: (res) => {
                            console.log('moveToLocation',res)
                            myLocation=res.city;
                            this.myCity=res.city;
                            this.oCity=res.city;
                            // var city = this.city;
                            // city.address = this.myCity;
                            // city = getSign(city, sid)
                            // this.city=city;
                            this.getCity()
                        },
                        complete: function () {
                            
                        }
                    });
                },
                fail: function () {}
            });
        },
        getCity: function () {//获取登记处地址
            let city=this.myCity;
            let sid=this.sid;
            let param={address:city};
            param=getSign(param,sid);
            console.log('getCity param',param)
            swan.request({
                url: wed_url.z_url+'?s=area/searchcity',
                dataType: 'json',
                data: this.city,
                header:{"content-type": "application/json" },
                method: 'POST',
                success: (res) => {
                    console.log('getCity',res.data)
                    this.city_id=res.data.data.city_id;
                },
                complete: function () {
                    that.getReg()
                }
            })
        },
        getReg: function () {
            var that = this;
            swan.request({
                url: app.globalData.reg_url,
                dataType: 'json',
                header:{"content-type": "application/json;" },
                method: 'GET',            
                data: {
                    city_id: this.city_id,
                    bd_tx: 0,
                },
                success: (res) => {
                    console.log('gitReg',res.data)
                    if(res.data.data.length==0){
                        swan.showToast({
                            title:"没有相关内容",
                            icon:"none"
                        })
                    };
                    this.regList=res.data.data
                },
                complete: function () {
                that.getMarkers() 
                }
            })
        },
        getMarkers: function () {
            var that = this;
            var markers = [];
            var arr = this.regList;
            for (var key in arr) {
                var str = arr[key].baidumap;
                var baidumap = str.split(",");
                var item = {
                    markerId: parseInt(key),
                    iconPath: "../../static/images/markers_icon.png",
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
            this.setData.markers=markers;
            this.map=true;
            var arr = [];
            for (var i in markers) {
                var coor = {
                    latitude: markers[i].latitude,
                    longitude: markers[i].longitude,
                }
                arr.push(coor)
            };
            this.arr=arr;
            that.includePoints()
        },
        includePoints:function(){
            var arr=this.arr;
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
                url: '../cityList/cityList'
            });
        },   
    },
    mounted(){
        this.mapContext = swan.createMapContext("map");
        // this.moveToLocation();
        var arr = this.markers        
    },
    onShow: function () {
        // 监听页面显示的生命周期函数
           this.areaSelection()
        
    },
}
</script>
<style scoped>
@import url('./index.css');
</style>
