var DingDongDispatcher = require('../dispatcher/DingDongDispatcher');
var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');
var ScheduleStore = require('./ScheduleStore');
var CHANGE_EVENT = 'change';
var departs=[];
var users=[];
var host =  "https://120.76.168.214:6443";
var WorkmatesStore = assign({}, EventEmitter.prototype, {
    emitChange: function() {
        this.emit(CHANGE_EVENT);
    },
    addChangeListener: function(callback) {
        this.on(CHANGE_EVENT, callback);
    },
    removeChangeListener: function(callback) {
        this.removeListener(CHANGE_EVENT, callback);
    },
    queryWorkmates:function() {
        var user = ScheduleStore.getUser();
        getData("../api/workmates.json",{}, function(data){
        //getData("https://120.76.168.214:6443/rest/pc/doctors/"+ScheduleStore.getUser().id,{},function(data){
            if(data.responseMsg=="1") {
            }
            WorkmatesStore.emitChange();
        },function(v1,v2,v3){});
    },
    saveType:function(type) {
        var user =  ScheduleStore.getUser();
        var params = {
            "id":user.id,
            "type":type
        };
        //postData("../api/type.json",params,function(data){
        postData("https://120.76.168.214:6443/rest/schedule/type/v1",params,function(data){
            if(data.responseMsg == "1") {
                types.push(type);
            }
            WorkmatesStore.emitChange();
        },function(v1,v2,v3){})
    },
    delType:function(type) {

    }

});


WorkmatesStore.dispatchToken = DingDongDispatcher.register(function(action) {
    switch(action.type) {
        default:
            break;
    }
});

module.exports = WorkmatesStore;
