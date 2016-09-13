var DingDongDispatcher = require('../dispatcher/DingDongDispatcher');
var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');
var CHANGE_EVENT = 'change';
var Const = require('../public/Const');

var detail={};
var list;
var timezones=[];
var repeat=[];
var remind=[];
//选择的病人
var schedule_patients=[];
//选择的同事
var schedule_workmates=[];
//我为他人创建的他人
var others=[];
//var user={"id":"Doctor_71010",
//        "imid": "71010"};
var recents=[];
var id =  window.sessionStorage.getItem("id");
var name = window.sessionStorage.getItem("name");
var user={"id":window.sessionStorage.getItem("id"),
        "imid": window.sessionStorage.getItem("imid"),
        "name": window.sessionStorage.getItem("name")};

var types=[];
var host =  Const.host;
var currentDate;

var ScheduleStore = assign({}, EventEmitter.prototype, {
    emitChange: function() {
        this.emit(CHANGE_EVENT);
    },
    addChangeListener: function(callback) {
        this.on(CHANGE_EVENT, callback);
    },
    removeChangeListener: function(callback) {
        this.removeListener(CHANGE_EVENT, callback);
    },
    changpage:function(_page) {
        current = _page;
    },
    getHost: function() {
        return host;
    },
    getCurrentDate: function() {
        if(currentDate==null) {
            currentDate = new Date();
            var now = new Date();
            currentDate.setHours(now.getHours()+1);
            currentDate.setMinutes(0);
        }
        return currentDate;
    },
    setCurrentDate:function(_date) {
        var date = _date;
        var now = new Date();
        date.setHours(now.getHours()+1);
        date.setMinutes(0);
        currentDate = date;
    },
    getSchedulePatients : function() {
        if(!$.isEmptyObject(detail)&&$.isArray(detail.patients))
            schedule_patients = detail.patients;
        return schedule_patients;
    },
    getScheduleWorkmates : function() {
        if(!$.isEmptyObject(detail)&&$.isArray(detail.workmates))
            schedule_workmates = detail.workmates;
        return schedule_workmates;
    },
    queryOther: function() {
        getData(host+"/rest/schedule/other/v1/"+user.id, {}, function(data){
            if(data.responseMsg=="1") {
                if($.isArray(data.users)) {
                    others = data.users;
                }
                ScheduleStore.emitChange();
            }
        },function(v1,v2,v3){})
    },
    getOthers : function() {
        return others;
    },
    getPage: function() {
        return current;
    },
    getList: function() {
        return list;
    },
    getDetail: function() {
        return detail;
    },
    getTimezones: function() {
        return timezones;
    },
    getRepeat: function() {
        return repeat;
    },
    getRemind: function() {
        return remind;
    },
    getUser:function() {

        return user;
    },
    queryUser:function() {},
    getTypes:function() {
        return types;
    },
    getRecents: function() {
        return recents;
    },
    //querySchedule
    queryMyToDo:function() {
        //getData("../api/events.json",{},function(data){
         getData(host+"/rest/schedule/mine/v1/"+user.id,{},function(data){
            if(data.responseMsg =="1")
            list = data.schedules;
            ScheduleStore.emitChange();
        },function(v1,v2,v3){});
    },
    //  获取我帮别人创建的人员列表
    queryMyOthers:function(query) {
        //getData("../api/events.json",{},function(data){
        getData(host+"/rest/schedule/mine/other/v1/"+user.id,{},function(data){
            list = data.data;
            ScheduleStore.emitChange();
        },function(v1,v2,v3){});
    },
    //    获取我帮创建用户的日程
    queryMyOther:function(otherid) {
        //getData("../api/events.json",{},function(data){
        getData(host+"/rest/schedule/other/v1/"+user.id+"/"+otherid,{},function(data){
            list = data.data;
            ScheduleStore.emitChange();
        },function(v1,v2,v3){});
    },

    queryList:function(params) {
        getData(host+"/rest/schedule/mine/v1/"+user.id,{},function(data){
            if(data.responseMsg =="1")
                list = data.schedules;
            ScheduleStore.emitChange();
        },function(v1,v2,v3){});

    },
    searchList: function(params) {
        getData(host+"/rest/schedule/search/v1/"+user.id+"/"+params.content,{},function(data){
            if(data.responseMsg =="1")
                list = data.schedules;
            ScheduleStore.emitChange();
        },function(v1,v2,v3){});
    },

    setDetail:function(params) {
        detail = params;
        ScheduleStore.emitChange();
    },
    deleteSchedule: function(params) {
        deleteData(host+"/rest/schedule/v1/"+params.id+"/"+params.userId,{},function(data) {
            if(data.responseMsg == "1") {
                ScheduleStore.queryDetail(params.id);
            }
        },function(v1,v2,v3){});
    },
    finishSchedule: function(params) {
        if(isNullOrEmpty(params.id)) {
            console.log("id不能为空")
            return;
        }
        putData(host+"/rest/schedule/end/v1/"+params.id,{}, function(data){
            if(data.responseMsg == "1") {
                ScheduleStore.queryDetail(params.id);
            }
        },function(v1,v2,v3){})
    },
    queryDetail:function(id) {
         getData(host+"/rest/schedule/v1/"+id,{}, function(data){
           if(data.responseMsg == "1") {
            detail = data;
           }

            ScheduleStore.emitChange();
        },function(v1,v2,v3){});
    },
    queryTimezones:function() {
        getData("../api/timezone.json",{}, function(data){
            timezones = data.data;
            ScheduleStore.emitChange();
        },function(v1,v2,v3){});
    },
    queryRemind:function() {
        getData("../api/remind.json",{}, function(data){
            remind = data.data;
            ScheduleStore.emitChange();
        },function(v1,v2,v3){})
    },
    queryRepeat:function() {
        getData("../api/repeat.json",{}, function(data){
            repeat = data.data;
            ScheduleStore.emitChange();
        },function(v1,v2,v3){})
    },
    queryRecents: function() {
        var self = this;
        getData(host+"/rest/schedule/member/v1/"+user.id,{}, function(data){
            if(data.responseMsg=="1") {
                if($.isArray(data.members))
                    self = data.members;
            }
            ScheduleStore.emitChange();
        },function(v1,v2,v3){});
    },
    queryPatients:function() {
        getData(host+"/rest/schedule/type/v1/"+user.id,{}, function(data){
        //getData(host+"/rest/schedule/type/v1/"+user.id, function(data){
            if(data.responseMsg=="1") {
                types = data.types;
            }
            ScheduleStore.emitChange();
        },function(v1,v2,v3){});
    },
    queryType:function() {
        getData(host+"/rest/schedule/type/v1/"+user.id,{}, function(data){
        //getData(host+"/rest/schedule/type/v1/"+user.id, function(data){
            if(data.responseMsg=="1") {
                types = data.types;
            }
            ScheduleStore.emitChange();
        },function(v1,v2,v3){});
    },
    saveType:function(type) {
        var params = {
            "id":user.id,
            "type":type
        }
        postData(host+"/rest/schedule/type/v1",params,function(data){
            if(data.responseMsg == "1") {
                types.push(type);
            }
            ScheduleStore.emitChange();
        },function(v1,v2,v3){})
    },
    delType:function(type) {

    },
    saveSchedule: function(params,success) {
        params.creator = user.id;

        //postData("../api/event.json",params, function(data){
         postData(host+"/rest/schedule/v1",params, function(data){
            if(data.responseMsg==1) {
                detail = data;

                ScheduleStore.emitChange();
                if($.isFunction(success) ) {
                    success(detail);
                }
            }
        },function(v1,v2,v3) {});
    },
    updateSchedule: function(params,success) {
        params.creator = user.id;

        //postData("../api/event.json",params, function(data){
         putData(host+"/rest/schedule/v1",params, function(data){
            if(data.responseMsg==1) {
                detail = data;

                ScheduleStore.emitChange();
                if($.isFunction(success) ) {
                    success(detail);
                }
            }
        },function(v1,v2,v3) {});
    },

});


ScheduleStore.dispatchToken = DingDongDispatcher.register(function(action) {
    switch(action.type) {
        default:
            break;
    }
});

module.exports = ScheduleStore;
