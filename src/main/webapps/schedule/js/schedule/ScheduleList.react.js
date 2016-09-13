var React = require("react");
var ReactRouter = require('react-router');
var Const = require('../public/Const');
var Link = ReactRouter.Link;
var ScheduleStore = require('./ScheduleStore');
function getStateFromStores() {
    return {
        list: [],
        user: ScheduleStore.getUser(),
    };
}
var ScheduleList = React.createClass({

    getInitialState: function () {
        return getStateFromStores();
    },
    componentDidMount: function () {
        var params = this.props.params;
        if (params == null) {
            return;
        }
        this.queryByParams(params);
    },
    queryByParams: function (params) {
        var self = this;
        var tag = params.tag;
        var creator = params.creator == null ? "" : "/" + params.creator;
        var content = params.content == null ? null : params.content;
        var workmateId = params.workmateId == null ? null : params.workmateId;

        var url = "";
        if (tag == "mine") {
            url = Const.host + "/rest/schedule/mine/v1/" + this.state.user.id;
            if (content != null) {
                url = Const.host + "/rest/schedule/search/mine/v1/" + this.state.user.id + "/" + content;
            }
        }
        else if (tag == "other" && creator == "") {
            url = Const.host + "/rest/schedule/mine/other/v1/" + this.state.user.id;

        }
        else if (tag == "other" && creator != "") {
            url = Const.host + "/rest/schedule/mine/other/v1/" + creator + "/" + this.state.user.id;

        } else if (tag == "byMe" && content != null) {
            url = Const.host + "/rest/schedule/search/v1/" + this.state.user.id + "/" + content;
        } else if (workmateId != null ) {
            url = Const.host + "/rest/schedule/other/v1/" + this.state.user.id + "/" + workmateId;
        }
        if (tag == "mine" || tag == "other" || workmateId != null) {
            getData(url, {}, function (data) {
                if (data.responseMsg == "1") {
                    if ($.isArray(data.users) && data.users.length > 0) {
                        self.setState({"list": data.users});
                    } else if ($.isArray(data.schedules) && data.schedules.length > 0) {
                        self.setState({"list": data.schedules});

                    }
                }
            }, function (v1, v2, v3) {
            })
        }
    },
    componentWillUnmount: function () {
        this.setState({list: []});
    },
    _onChange: function () {
        this.setState(getStateFromStores());
    },
    getListHtml: function () {
        var list = this.state.list;
        if (!$.isArray(this.state.list)) {
            return "";
        }
        var _html = [];
        list = _.sortBy(list, "time");
        _.map(list, function (item) {
            var t = new Date();
            t.setTime(item.time);
            var timeDesc = t.format("yyyy-MM-dd 周E");
            item.week = timeDesc;
            item.timeDesc = t.format("hh:mm");
            if (!$.isArray(item.workmates)) {
                item.workmates = [];
            }
            if (!$.isArray(item.patients)) {
                item.patients = [];
            }

            item.patientsCount = item.patients.length;
            item.workmatesCount = item.workmates.length;
        });
        var groups = _.groupBy(list, "week");
        _.map(groups, function (v, k) {
            var t = [];
            t.push(<div>{k}</div>);

            _.map(v, function (item) {
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
        var exportHtml = [];
        if (this.props.export) {
            exportHtml.push((<Link to="/export">
                <div className="exportBtn">导出</div>
            </Link>));
        }
        var otherHtml = [];
        if (!isNullOrEmpty(this.props.params) && this.props.params.tag == "other") {
            otherHtml.push((<Link to="/workmates">他人全部日程</Link>));
        }
        return (
            <div className='col-md-12 col-xs-12 col-sm-12'>
                {
                    exportHtml
                }
                {
                    otherHtml
                }
                {
                    this.getListHtml()
                }
            </div>
        );

    },
});

module.exports = ScheduleList;
