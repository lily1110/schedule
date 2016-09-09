var React = require("react");
var ReactRouter = require('react-router');
var Const = require('../public/Const');
function getStateFromStores() {
    return {
        list:[],
    };
}
var ScheduleList = React.createClass({

    getInitialState: function () {
        return getStateFromStores();
    },
    componentDidMount: function () {
        var params = this.props.params;
        if( params== null) {
            return;
        }
        this.queryByTag(params);
    },
    queryByTag:function(tag) {
        var self = this;
        if(tag=="mine" || tag=="other") {
            getData(Const.host+"/rest/schedule/"+tag+"/v1/"+user.id, {}, function(data){
                if(data.responseMsg=="1") {
                    if($.isArray(data.users)) {
                       self.setState({"list":data.users});
                    }
                }
            },function(v1,v2,v3){})
        }
    },
    queryByParams:function(params) {
        var self = this;
        var tag = params.tag;
        var creator = params.creator==null?"":"/"+params.creator;
        var url = Const.host+"/rest/schedule/"+tag+"/v1"+creator+"/"+user.id;
        if(tag=="mine" || tag=="other") {
            getData(url, {}, function(data){
                if(data.responseMsg=="1") {
                    if($.isArray(data.users)) {
                       self.setState({"list":data.users});
                    }
                }
            },function(v1,v2,v3){})
        }
    },
    componentWillUnmount: function () {
    },
    _onChange: function () {
        this.setState(getStateFromStores());
    },
    getListHtml:function() {
        var list = this.state.list;
        if(!$.isArray(this.state.list)) {
            return "";
        }
        var _html = [];
        list = _.sortBy(list,"time");
        _.map(list,function(item) {
            var t = new Date();
            t.setTime(item.time);
            var timeDesc = t.format("yyyy-MM-dd 周E");
            item.week = timeDesc;
            item.timeDesc = t.format("hh:mm");
            if(!$.isArray(item.workmates)) {
                item.workmates=[];
            }
            if(!$.isArray(item.patients)) {
                item.patients=[];
            }

            item.patientsCount = item.patients.length;
            item.workmatesCount = item.workmates.length;
        });
        var groups  = _.groupBy(list, "week");
        _.map(groups,function(v,k) {
            var t = [];
            t.push(<div>{k}</div>);

            _.map(v, function(item){
                    t.push(
                        <div>
                        <Link to={"/detail/"+item.id}>
                            <div>{ item.timeDesc}</div>
                            <div>{ item.content}</div>
                        </Link>
                        <div>参与同事:<Link to={"/schedule/workmates/"+item.id}>{item.workmatesCount}</Link>人</div>
                        <div>参与患者:<Link to={"/schedule/patients/"+item.id}>{item.patientsCount}</Link>人</div>
                        </div>
                );
            })
            _html.push((<div>{t}</div>))
        });
        return _html;
    },
    render: function () {
        var self = this;
        return (
            <div className='col-md-12 col-xs-12 col-sm-12'>
            {
                this.getListHtml()
            }
            </div>
        );

    },
});

module.exports = ScheduleList;
