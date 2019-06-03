import {
    hexMD5
} from "./md5.js"

function getTimestamp() { //获取时间戳
    var ts = Math.round(new Date().getTime() / 1000).toString();
    return ts
}

function getSign(data, sid) {
    var key = sid;
    var param = "";
    for (var idx in data) {
        if (idx !== 'sign' && idx !== 'timestamp') {
            param += (idx + '=' + data[idx] + '&')
        }
    }
    var timestamp = getTimestamp()
    param = encodeURI(param + "timestamp=" + timestamp);
    param = param.toUpperCase().split("&").sort().join("&") + key;
    param = hexMD5(param);
    data.sign = param;
    data.timestamp = timestamp;
    console.log('getSign',data)
    return data;
}
export {
    getSign
}