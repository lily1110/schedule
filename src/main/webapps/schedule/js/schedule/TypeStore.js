var DingDongDispatcher = require('../dispatcher/DingDongDispatcher');
var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');
var ScheduleStore = require('./ScheduleStore');
var CHANGE_EVENT = 'change';
var types=[];
var host =  "https://120.76.168.214:6443";
var TypeStore = assign({}, EventEmitter.prototype, {
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

    getTypes:function() {
        return types;
    },
    queryType:function() {
        var user = ScheduleStore.getUser();
        //getData("../api/type.json",{}, function(data){
        getData("https://120.76.168.214:6443/rest/schedule/type/v1/"+ScheduleStore.getUser().id,{},function(data){

                    //getData(host+"/rest/schedule/type/v1/"+user.id, {},function(data){
            if(data.responseMsg=="1") {
                types = data.types;
            }
            TypeStore.emitChange();
        },function(v1,v2,v3){});
    },
    saveType:function(type,success) {
        var user =  ScheduleStore.getUser();
        var params = {
            "id":user.id,
            "type":type
        };
        //postData("../api/type.json",params,function(data){
        postData("https://120.76.168.214:6443/rest/schedule/type/v1",params,function(data){
            if(data.responseMsg == "1") {
                types.push(type);
                if($.isFunction) {
                    success()
                }
            }
            TypeStore.emitChange();
        },function(v1,v2,v3){})
    },
    deleteType:function(type) {
        if(!confirm("确认删除该分类?")) {
            return
        }
        var user =  ScheduleStore.getUser();
        deleteData("https://120.76.168.214:6443/rest/schedule/type/v1/"+user.id+"/"+type,{},function(data){
            if(data.responseMsg == "1") {
               types =  _.filter(types,function(t){
                   return t!= type;
               })
            } else {
                alert(data.responseMsg)
            }
            TypeStore.emitChange();
        },function(v1,v2,v3){})
    },


});


TypeStore.dispatchToken = DingDongDispatcher.register(function(action) {
    switch(action.type) {
        default:
            break;
    }
});

module.exports = TypeStore;
