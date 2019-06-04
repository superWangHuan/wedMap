import {
    hexMD5
} from "./md5.js";
let key = 'wed.114@&%detclkq$';

function getTimestamp() { //获取时间戳
    let ts = Math.round(new Date().getTime() / 1000).toString();
    return ts;
}
function getSign(data, sid) {
    if(sid){
        data.sid=sid
    }
    let obj={};
    let param = "";
    let timestamp = getTimestamp();
    if (sid === "") {
        sid = key
    } else {
        sid = hexMD5(sid);
    }
    
    for (let idx in data) {
        param += encodeURIComponent(idx) + '=' + encodeURIComponent(data[idx]) + '&';
        obj[idx]=data[idx];
    }
    param += "timestamp" + "=" + timestamp;
    param = hexMD5(param.toUpperCase().split("&").sort().join("&")+sid);
    obj.timestamp=timestamp;
    obj.sign=param;
    data=obj;
    return data;
}
export {getSign,api_url}