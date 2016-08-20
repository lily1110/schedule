var toTop = function() {
    location.hash = "#top";
}
var toPage=function() {
    location.hash = "#top";
}
var Participants = function(list) {
    this.list = list;
}
var detail;
Participants.prototype.getRenderHtml = function(selected) {
    var groups = _.groupBy(this.list,"departmentName");
    var _html = "";
    _.map(groups,function(v,k) {
        _html+="<optgroup label='"+k+"'>";
        _.map(v,function(t){
            var isSelectedHtml = "";

            for (var i =0 ; $.isArray(selected)&& i<selected.length;i++){
                if(t.id == selected[i].id) {
                    isSelectedHtml= " selected='selected' ";
                    break;
                }
            }

            _html+="<option "+isSelectedHtml+" value='"+ t.id+"'>"+t.name+"</option>";
        });
        _html+="</optgroup>";
    });
    return _html;
}


var toCreateSchedule = function() {
    $(".content-wrapper").css("display","none");
    //$("#edit").css("display","block");
    detail = new ScheduleDetail({});
    detail.edit();
    $(".main-header .mr").css("display","none");
    $(".main-header .mr.finish-schedule").css("display","block");

}
var saveSchedule = function() {
     var id;
    if(detail!=null) {
        id = detail.save();
    }
    else {
        alert("无对象可以保存");
    }
    //toShowDetail({},id);

}
var toShowDetail = function(obj) {
    getData("api/event.json", function(data){
        var item = data.data;
        detail = new ScheduleDetail(item);
        detail.show();
    },function(v1,v2,v3){})
}

var selectType = function(obj) {
    var text = $(obj).text();
    var type = $(obj).parent().attr("data-id");
    $("#schedule-type").html(text);
    $("#schedule-type").attr({"data-id":type});
    $(".schedule-type").css("display","none");

}
var toSelectWorkmates = function() {
    $(".schedule-workmates").show();
    toPage();
}
var toSelectPatients = function() {
    $(".schedule-patients").show();
    toPage();
}

var myTodoList = function() {
    getData("api/events.json",function(data){
        var list = data.data;
        if($.isArray(list)) {
            var scheduleList = new ScheduleList(list,null);
            scheduleList.renderList();
        }
    },function(v1,v2,v3){})
}
var showList = function(list) {
    $(".content-wrapper").css("display","none");
    $("#events").css("display","block");
    var _html = "";
    list = _.sortBy(list,"doTime");
    _.map(list,function(item) {
        var t = new Date();
        t.setTime(item.doTime*1000);
        var timeDesc = t.format("yyyy/MM/dd 周E");
        item.week = timeDesc;
        item.time = t.format("hh:mm");
        item.patientsCount = item.patients.length;
        item.workmatesCount = item.patients.length;
    });
    var groups  = _.groupBy(list, "week");
    _.map(groups,function(v,k) {
        _html+="<div class='col-md-6 col-xs-12 col-sm-12' style='margin-top: 20px'><div>"+k+"</div>";

        _.map(v, function(item){
            _html+=  "<div>"+ item.time+"</div>"+
                "<div>"+ item.content+"</div>"+
                "<div>参与同事:"+ item.workmatesCount+"人</div>"+
                "<div>参与患者:"+ item.patientsCount+"人</div>";
        })
        _html+="</div>";

    })
    $("#eventsList").html(_html);
}
var finishEvents = function(obj){}

//添加类别
var addType = function(obj) {
    var text = $(".schedule-type div input").val()
    postData("api/type.json",{"value":text},function(data){
        detail.typeRender.add({"id":10,"value":"new"});
    },function(v1,v2,v3){})
}
//显示类别
var showType = function() {
    $(".schedule-type").css("display","block");
}
