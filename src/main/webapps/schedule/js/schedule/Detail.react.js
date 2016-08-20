var React = require("react");
var PageStores = require("../page/stores/PageStores");
var PageActionCreators = require("../page/actions/PageActionCreators");
var ScheduleStore = require("./ScheduleStore");
var Edit = require("./Edit.react");
var ReactRouter = require('react-router');
var Link = ReactRouter.Link;
var IndexLink = ReactRouter.IndexLink;
var browserHistory = ReactRouter.browserHistory;
var Image = require("./Image.react")
function getStateFromStores() {
    return {
        page: PageStores.getPage(),
        detail: ScheduleStore.getDetail(),
        user: ScheduleStore.getUser(),
    };
}
var Calendar = React.createClass({

    getInitialState: function () {
        return getStateFromStores();
    },
    componentDidMount: function () {
        PageStores.addChangeListener(this._onChange);
        ScheduleStore.addChangeListener(this._onChange);
        var id = this.props.params.id;
        if (isNullOrEmpty(id)) {
            id = this.props.data_id;
        }
        ScheduleStore.queryDetail(id);

    },
    componentWillUnmount: function () {
        PageStores.removeChangeListener(this._onChange);
        ScheduleStore.removeChangeListener(this._onChange);
        ScheduleStore.setDetail(null);
        PageActionCreators.changePage("detail");

    },
    _onChange: function () {
        this.setState(getStateFromStores());
    },
    toEdit: function () {
        PageActionCreators.changePage("detail.edit");

    },
    deleteSchedule:function() {
        if(!confirm("删除你的日程?")) {
            return
        }
        var obj = this.state.detail;
        var id = obj.id;
        var u = this.state.user;
        var workmates = obj.workmates;
        var hasUser = false;
        _.each(workmates,function(t) {
            if(t.id == u.id) {
                hasUser = true;
            }
        })
        if(!hasUser) {
            alert("您未参与该日程,不能删除");
            return
        }
        var params = {
            id:id,
            userId:u.id,
        }
        ScheduleStore.deleteSchedule(params);
    },
    finishSchedule: function() {
        if(!confirm("确定完成该日程?")||isNullOrEmpty(this.state.detail.id)) {
            return
        }
        var params = {
            id:this.state.detail.id,
        }
        ScheduleStore.finishSchedule(params);

    },

    getHtml: function () {
        var obj = this.state.detail;
        if (obj == null) {
            return "";
        }
        var self = this;
        var workmates_html = "参与的同事: ";
        _.each(obj.workmates, function (t) {
            workmates_html += t.name + "  ";
        })

        var pateints_html = "参与的病患: ";
        _.each(obj.patients, function (t) {
            pateints_html += t.name + "  ";
        })
        var t = new Date();
        t.setTime(obj.time);
        var timeDesc = t.format("yyyy-MM-dd 周E HH:mm");
        var remindDesc = "";

        if (obj.remind <= 0) {
            remindDesc = "不提醒";
        } else {
            var d = parseInt((obj.time - obj.remind) / (1000 * 60));
            switch (d) {
                case 0:
                    remindDesc = "事件发生时";
                    break;
                case 5:
                    remindDesc = "提前5分钟";
                    break;
                case 15:
                    remindDesc = "提前15分钟";
                    break;
                case 30:
                    remindDesc = "提前30分钟";
                    break;
                case 60:
                    remindDesc = "提前1小时";
                    break;
                case 120:
                    remindDesc = "提前2小时";
                    break;
                case 300:
                    remindDesc = "提前5小时";
                    break;
                case 1440:
                    remindDesc = "提前1天";
                    break;
                case 2880:
                    remindDesc = "提前2天";
                    break;
                case 10080:
                    remindDesc = "提前一周";
                    break;

            }
        }

        var _html = [];
        if(!_.isNull(obj)&&!isNullOrEmpty(obj.id)) {
            _html.push(<div>
                <div className="col-md-2"></div>
                <div className="col-md-8 col-xs-12 col-sm-12">
                    <div className="box box-primary" style={{padding: "30px 5px"}}>
                        <div className="row">
                            <div className="col-md-12 ">
                                <div>{obj.content}</div>
                                <div>备注内容</div>
                                <div>{obj.location}</div>
                                <div>{obj.type}</div>
                                <div>{timeDesc}</div>
                                <div>{remindDesc}</div>
                                <div>{obj.repeatDesc}</div>
                                <div>{"创建人:"+obj.creator.name}</div>
                                <div>{obj.status==1?"已完成":"待处理"}</div>
                                <div>{workmates_html}</div>
                                <div>{pateints_html}</div>
                                <div>
                                    <Image isEdit={false} imgList={$.isArray(obj.imgs)?obj.imgs:[]}></Image>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-12">
                                <div onClick={this.finishSchedule} className="create_btn to_create" style={{marginTop: '30px'}}>确认完成</div>
                                <div className="create_btn to_create" style={{marginTop: '30px'}} onClick={this.toEdit}>修改
                                </div>
                                <div onClick={this.deleteSchedule} className="create_btn to_create" style={{marginTop: '30px'}}>删除</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>);
        }
        return _html;
    },
    render: function () {

        var page = this.state.page;

        if (page.indexOf("edit") >= 0) {
            return <Edit isUpdate={true} detail={this.state.detail}/>
        }

        return (
            <div>
                {this.getHtml()}
            </div>
        );

    },
});

module.exports = Calendar;
