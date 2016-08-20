var host_addr ="";
Date.prototype.format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours() % 12 == 0 ? 12 : this.getHours() % 12, //小时
        "H+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    var week = {
        "0": "日",
        "1": "一",
        "2": "二",
        "3": "三",
        "4": "四",
        "5": "五",
        "6": "六"
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    if (/(E+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "星期" : "周") : "") + week[this.getDay() + ""]);
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }
    return fmt;
}
sendData = function(_method,_url,_data,_success,_error) {
    var json_data = JSON.stringify(_data);
    $.ajax({
        type:_method,
        url:  host_addr + _url,
        contentType: "application/json; charset=utf-8",
        data:json_data,
        success:_success,
        error: function(XMLHttpRequest, textStatus, errorThrown){
            if(XMLHttpRequest.status == '401')
                toLogin(XMLHttpRequest)
            _error(XMLHttpRequest, textStatus, errorThrown);
        },
    });
}

postData=function(_url,_data,_success,_error) {
    sendData("POST",_url,_data,_success,_error)
}
deleteData=function(_url,_data,_success,_error) {
    sendData("DELETE",_url,_data,_success,_error)
}
putData=function(_url,_data,_success,_error) {
    sendData("PUT",_url,_data,_success,_error)
}
patchData=function(_url,_data,_success,_error) {
    sendData("PATCH",_url,_data,_success,_error)
}
getData=function(_url,params,_success,_error) {
    var paramsStr = "1=1&";
    _.map(params,function(v,k) {
        paramsStr+= (k+"="+v);
    })
       $.ajax({
        url: host_addr + _url+"?"+paramsStr,
        contentType: "application/json; charset=utf-8",
        cache:false,
        async:true,
       //beforeSend: function(request) {
       //    request.setRequestHeader("", "Chenxizhang");
       //},
        success:_success,

        error: function(XMLHttpRequest, textStatus, errorThrown){
            if(XMLHttpRequest.status == '401')
                toLogin(XMLHttpRequest)
            _error(XMLHttpRequest, textStatus, errorThrown);
        },
    });
}
toLogin = function(XMLHttpRequest) {
        $(window.location).attr('href', "login.html");
}

function toFixed2 (num) {
    return parseFloat(+num.toFixed(2));
}
function trim(str){ //删除左右两端的空格
    return str.replace(/(^\s*)|(\s*$)/g, "");
}
function isNullOrEmpty(strVal) {
    if (strVal == '' || strVal == null || strVal == undefined) {
        return true;
    } else {
        return false;
    }
}
