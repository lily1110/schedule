var React = require("react");
var PageStores = require("../page/stores/PageStores");
var ScheduleStore = require("../schedule/ScheduleStore");
var ReactRouter = require('react-router');
var Link = ReactRouter.Link;
var MenuBar = require('../MenuBar.react');
function getStateFromStores() {
    return {
        page: PageStores.getPage(),
    };
}
var Calendar = React.createClass({
    getInitialState: function () {
        return getStateFromStores();
    },
    componentDidMount: function () {
        PageStores.addChangeListener(this._onChange);
        this.loadSchedule();

    },
    componentWillUnmount: function () {
        PageStores.removeChangeListener(this._onChange);
    },
    _onChange: function () {
        this.setState(getStateFromStores());
    },
    renderDaySchedule: function (day) {
        var _html = [];
        _.map(this.schedules, function (item) {
            if (item.doTimeDesc == day) {
                var time = new Date();
                time.setTime(item.time);

                _html.push((<Link to={'/detail/'+item.id}>
                    <div>
                        <div>{time.format("MM月dd日 周E HH:mm:ss")}</div>
                        <div>{item.content}</div>
                    </div>
                </Link>));
            }
        });
        this.setState({"dayList": _html});
    },
    loadSchedule: function () {
        var self = this;
        var host = "https://120.76.168.214:6443";
        console.log( ScheduleStore.getUser().id+"  "+ ScheduleStore.getUser().name);
        getData(host + "/rest/schedule/mine/v1/" + ScheduleStore.getUser().id, {}, function (data) {
            if (data.responseMsg == "1") {
                self.schedules = data.schedules;
                self.renderSchedule();
            }
        }, function () {
            self.renderSchedule();
        })

    },
    ini_events: function (ele) {
        ele.each(function () {
            var eventObject = {
                title: $.trim($(this).text()) // use the element's text as the event title
            };
            $(this).data('eventObject', eventObject);
        });
    },
    renderSchedule: function () {
        var events = [];
        if ($.isArray(this.schedules) && this.schedules.length > 0) {
            this.schedules = _.sortBy(this.schedules, "time");
            _.map(
                this.schedules, function (item) {
                    var _date = new Date();
                    _date.setTime(item.time);
                    var _dateDesc = _date.format("yyyy-MM-dd");
                    item.doTimeDesc = _dateDesc;
                    var t = {
                        "title": item.content,
                        "start": _date
                    }
                    events.push(t);
                }
            )
            this.renderDaySchedule(new Date().format("yyyy-MM-dd"));
        }
        this.ini_events($('#external-events div.external-event'));
        var self = this;
        $('#calendar').fullCalendar({
            header: {
                left: 'prev,next today',
                center: 'title',
                right: 'month,agendaWeek,agendaDay'
            },
            buttonText: {
                prevYear: '去年',
                nextYear: '明年',
                today: '今天',
                month: '月',
                week: '周',
                day: '日'
            },
            events: events,
            editable: true,
            droppable: true, // this allows things to be dropped onto the calendar !!!
            drop: function (date, allDay) { // this function is called when something is dropped
            },

            monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月',
                '八月', '九月', '十月', '十一月', '十二月'],
            dayNames: ['星期日', '星期一', '星期二', '星期三',
                '星期四', '星期五', '星期六'],
            dayNamesShort: ['日', '一', '二', '三',
                '四', '五', '六'],
            dayClick: function (date, allDay, jsEvent, view) {
                $(".fc-day.fc-widget-content").css('background-color', 'white');
                $(".fc-day.fc-widget-content.fc-today").css('background', '#fcf8e3');
                $(this).css('background-color', 'rgb(243, 251, 255)');
                var _date = new Date();
                _date.setTime(date);
                var _dateDesc = _date.format("yyyy-MM-dd");
                self.renderDaySchedule(_dateDesc);
                ScheduleStore.setCurrentDate(_date);
            }

        });
        var currColor = "#3c8dbc"; //Red by default
        var colorChooser = $("#color-chooser-btn");
        this.adapter();
    },
    adapter: function () {
        $(".fc-day-grid-container.fc-scroller").css("height", "auto");
        var self = this;
        $(".fc-ltr .fc-basic-view .fc-day-number").click(function () {
            var date = $(this).attr("data-date");
            self.renderDaySchedule(date);
        })
    },

    render: function () {
        var daySchedules = this.state.dayList;
        return (
            <div className="col-md-12 col-xs-12 col-sm-12">
                <MenuBar moreLink={"/all"} more={"全部"}/>

                <section className="content">
                    <div className="row">
                        <div className="col-md-12 col-xs-12 col-sm-12">
                            <div className="box box-primary">
                                <div className="box-body no-padding">
                                    <div id="calendar"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-12">
                            <Link to="/edit">
                                <div onclick="toCreateSchedule()" className="create_btn to_create">添加日程</div>
                            </Link>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-12">
                            <div>
                                {daySchedules}
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-12">

                        </div>
                    </div>

                </section>
            </div>
        );

    },
});

module.exports = Calendar;
