var React = require("react");
var Select2 = require("react-select2");
var PageStores = require("../page/stores/PageStores");
var PageActionCreators = require("../page/actions/PageActionCreators");
var MenuBar = require("../MenuBar.react");
var ScheduleStore = require("./ScheduleStore");
var Type = require("./Type.react");
var Workmates = require("./Workmates.react");
var Patients = require("./Patients.react");
var Detail = require("./Detail.react");
var SelectAttender = require("./SelectAttender.react");
var Image = require("./Image.react");
var ReactRouter = require('react-router');

function getStateFromStores() {
    return {
        timezones: ScheduleStore.getTimezones(),
        repeats: ScheduleStore.getRepeat(),
        reminds: ScheduleStore.getRemind(),
        page: PageStores.getPage(),
        user: ScheduleStore.getUser(),
    };
}
var Edit = React.createClass({
    imgs:[],
    getInitialState: function () {
        var data = getStateFromStores();
        data.page = "edit";
        data.open = false;
        var detail = this.props.detail;
        var selectedType = "未分类";
        var content = "";
        var t = ScheduleStore.getCurrentDate();

        var timezone = "时区一";
        var remind = -1;
        var repeat = "不重复";
        var remark = "";
        var location = "";
        var patientsDesc = "";
        var workmatesDesc = "";
        var patients = [];
        var workmates = [];
        var id = "";
        var status = 0;
        var imgs =[];
        if (!$.isEmptyObject(detail)) {
            id = detail.id;
            if (!isNullOrEmpty(detail.type)) {
                selectedType = detail.type;
            }
            if (!isNullOrEmpty(detail.status)) {
                status = detail.status;
            }
            if (!isNullOrEmpty(detail.content)) {
                content = detail.content;
            }
            if (!isNullOrEmpty(detail.time)) {
                t.setTime(detail.time);
            }
            if (!isNullOrEmpty(detail.timezone)) {
                timezone = detail.timezone;
            }
            if (!isNullOrEmpty(detail.remind)) {
                console.log(detail.time +" - "+ detail.remind+" ="+( detail.time - detail.remind));
                remind = parseInt((detail.time - detail.remind) /(1000* 60));
                console.log(remind);
            }
            if (!isNullOrEmpty(detail.repeat)) {
                repeat = detail.repeat;
            }

            if (!isNullOrEmpty(detail.remark)) {
                remark = detail.remark;
            }

            if (!isNullOrEmpty(detail.location)) {
                location = detail.location;
            }
            if($.isArray(detail.imgs)) {
                imgs = detail.imgs;
                this.imgs = imgs;
            }
            _.each(detail.patients, function (t) {
                patientsDesc += t.name + "  ";
            });
            _.each(detail.workmates, function (t) {
                workmatesDesc += t.name + "  ";
            });
            if (!$.isArray(detail.patients)) {
                detail.patients = [];
            }
            if (!$.isArray(detail.workmates)) {
                detail.workmates = [];
            }

            patients = detail.patients;
            workmates = detail.workmates;

        }
        var dateDesc = t.format("yyyy-MM-dd");
        var timeDesc = t.format("HH:mm");

        data.id = id;
        data.status = status;
        data.selectedType = selectedType;
        data.content = content;
        data.dateDesc = dateDesc;
        data.timeDesc = timeDesc;
        data.timezone = timezone;
        data.remind = remind;
        data.repeat = repeat;
        data.remark = remark;
        data.location = location;
        data.patientsDesc = patientsDesc;
        data.workmatesDesc = workmatesDesc;
        data.patientsWithName = patients;
        data.workmatesWithName = workmates;
        data.imgs = this.imgs;
        var patientIds = [];
        var workmateIds = [];
        _.each(patients,function(t){
            patientIds.push(t.id);
        })
        _.each(workmates,function(t){
            workmateIds.push(t.id);
        })
        data.patients = patientIds;
        data.workmates = workmateIds;
        return data;
    },
    componentDidMount: function () {
        PageStores.addChangeListener(this._onChange);
        ScheduleStore.addChangeListener(this._onChange);
        ScheduleStore.queryTimezones();
        ScheduleStore.queryRemind();
        ScheduleStore.queryRepeat();
        this.initStyle();
    },
    initStyle: function () {
        $('#schedule-date').datepicker({
            autoclose: true,
            startDate: new Date(),
            format: "yyyy-mm-dd",
        });
        $(".timepicker").timepicker({
            showInputs: false,
            showMeridian: false,
            minuteStep: 5,
        });
    },
    componentDidUpdate: function () {
        this.initStyle();
    },
    componentWillUnmount: function () {
        PageStores.removeChangeListener(this._onChange);
        ScheduleStore.removeChangeListener(this._onChange);
        console.log("will unmount");

    },
    _onChange: function () {
        this.setState(getStateFromStores());
    },
    save: function () {
        var params = {};
        var timeDesc = "";
        var time;
        var remind;
        if (isNullOrEmpty(this.state.content)) {
            alert("内容不能为空");
            return;
        }
        params.content = this.state.content;
        if (isNullOrEmpty(this.state.dateDesc)) {
            alert("日期不能为空");
            return;
        }
        if (isNullOrEmpty(this.state.timeDesc)) {
            alert("时间不能为空");
            return;
        }
        timeDesc += $("#schedule-date").val() + " " + $("#schedule-time").val() + ":00";
        time = new Date(timeDesc).getTime();
        if (time < new Date().getTime()) {
            alert("不能小于当前时间");
            return;
        }
        params.time = time;
        params.remind = time - parseInt(this.state.remind * 60 * 1000);

        if (isNullOrEmpty(this.state.repeat)) {
            alert("重复类型不能为空");
            return;
        }
        params.repeat = parseInt(this.state.repeat);
        if (!isNullOrEmpty(this.state.id)) {
            params.id = this.state.id;
        }
        if (!isNullOrEmpty(this.state.status)) {
            params.status = this.state.status;
        }
        var workmates = this.state.workmates;
        if (!$.isArray(workmates) || workmates.length == 0) {
            if (confirm("设置为自己的日程")) {
                workmates.push(this.state.user.id);
            } else {
                alert("请选择参与人员");
                return;
            }
        }
        if($.isArray(this.imgs)) {
            params.imgs=this.imgs;
        }
        params.type = this.state.selectedType;
        params.location = this.state.location;
        params.workmates = workmates;
        params.patients = this.state.patients;
        if (this.props.isUpdate) {
            ScheduleStore.updateSchedule(params, this.saveSuccess);

        }
        else {
            ScheduleStore.saveSchedule(params, this.saveSuccess);

        }
    },
    saveSuccess: function (obj) {
        PageActionCreators.changePage("");
        window.location.href = "schedule.html#/detail/" + obj.id;
    },
    timezoneChange: function (event) {
        this.setState({timezone: event.target.value});
    },
    remindChange: function (event) {
        this.setState({remind: event.target.value});
    },
    repeatChange: function (event) {
        this.setState({repeat: event.params.data.id});
    },
    timezoneHtml: function () {
        //if(this.state.timezones.length>0)
        //return (
        //    <Select2
        //        defaultValue={this.state.timezone}
        //        data={this.state.timezones}
        //        onChange={this.timezoneChange}
        //    />
        //);
        return "";
    },
    remindHtml: function () {
        if(this.state.reminds.length>0) {
            return (<Select2
                defaultValue={this.state.remind}
                data={this.state.reminds}
                onChange={this.remindChange}
            />);
        }
        return "";

    },
    repeatHtml: function () {
        if (this.state.repeats.length > 0)
            return (<Select2
                defaultValue={this.state.repeat}
                data={this.state.repeats}
                onSelect={this.repeatChange}
            />);
        return "";

    },
    toSelectType: function () {
        PageActionCreators.changePage("detail.edit.types");
    },
    selectType: function (_type) {
        //this.setState({"selectedType":_type});

        this.setState({page: "detail.edit", "selectedType": _type});
        //var detail = this.state.detail;
        //ScheduleStore.setDetail(detail);
    },
    toSelectPatients: function () {
        PageActionCreators.changePage("detail.edit.patients");
    },
    toSelectWorkmates: function () {
        PageActionCreators.changePage("detail.edit.workmates");

    },
    handleContentChange: function (event) {
        this.setState({content: event.target.value});
    },
    uploadImg: function(imgList) {
        this.imgs = imgList;
    },
    renderEdit: function () {
        var self = this;
        var workmatesDesc = "已选择";
        var dcount = 0;
        _.each(this.state.workmates, function (t) {
            if (t != null && t.id != null && t.id.indexOf("ALL")) {
                dcount++;
            } else if (t.indexOf("ALL") >= 0) {
                dcount++;
            }
        });
        var wcount = this.state.workmates.length - dcount;
        if (dcount > 0) {
            workmatesDesc += dcount + "个部门 "
        }
        if (wcount > 0) {
            workmatesDesc += wcount + "个同事"

        }
        var patientsDesc = "已选择" + this.state.patients.length + "个病人";
        //<div className="event-drop">
        //    <div>地点:</div>
        //    <input id="schedule-location" type="text" className="form-control"
        //           placeholder="请输入执行地点" style={{marginTop: '10px'}}
        //           defaultValue={this.state.location}/>
        //</div>
        return (
            <div className='col-md-12 col-xs-12 col-sm-12'>
                <MenuBar _left="首页" leftLink={"/"} moreLink={"/"} more={"取消"}/>

                <section className="content"  style={{marginTop:'20px'}}>
                    <div className="row">
                        <div className="col-md-12 col-xs-12 col-sm-12">
                            <div className="box box-primary" style={{padding: "10px 5px",margin:"5px"}}>
                        <textarea id="schedule-content" onChange={this.handleContentChange} value={this.state.content}
                                  type="text" className="form-control" placeholder="请输入日程内容"
                                  style={{marginTop: '30px'}}></textarea>
                                <div className="form-group type">
                                    <span >类别</span>
                                    <div onClick={self.toSelectType}
                                         style={{width: '80%',display:'inline',float: 'right',minHeight:'30px'}}>{this.state.selectedType}</div>
                                </div>
                                <div className="form-group">
                                    <div style={{paddingLeft: '10px',paddingBottom: '5px'}}>时间:</div>
                                    <div className="input-group date">
                                        <div className="input-group-addon">
                                            <i className="fa fa-calendar"></i>
                                        </div>
                                        <input id="schedule-date" type="text" className="form-control pull-right"
                                               defaultValue={this.state.dateDesc}/>
                                    </div>
                                    <div className="bootstrap-timepicker" style={{marginTop: '10px'}}>
                                        <div className="form-group">
                                            <div className="input-group">
                                                <div className="input-group-addon">
                                                    <i className="fa fa-clock-o" style={{fontSize: '18px'}}></i>
                                                </div>
                                                <input id="schedule-time" type="text"
                                                       className="form-control timepicker"
                                                       defaultValue={this.state.timeDesc}/>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className=" event-drop" style={{marginTop: '10px',display:"none"}}>
                                    <div>时区</div>
                                    {
                                        self.timezoneHtml()
                                    }
                                </div>
                                <div className=" event-drop" style={{marginTop: '10px'}}>
                                    <div>提醒</div>
                                    {
                                        self.remindHtml()
                                    }
                                </div>
                                <div className=" event-drop" style={{marginTop: '10px'}}>
                                    <div>重复</div>
                                    {
                                        self.repeatHtml()
                                    }
                                </div>
                                <div>
                                    <div onClick={function(){self.setState({"open":!self.state.open})}}
                                         style={{marginTop: '10px'}}>展开
                                    </div>
                                    {
                                        this.state.open ? (<div>
                                            <div className="event-drop">
                                                <div>备注:</div>
                                                <input id="schedule-remark" type="text" className="form-control"
                                                       placeholder="请输入备注" style={{}} defaultValue={this.state.remark}/>
                                            </div>

                                        </div>) : ""
                                    }

                                </div>
                                <div>
                                    <Image addImgs={this.uploadImg} isEdit={true} imgList={this.state.imgs} />
                                </div>
                                <div className="attendee " style={{marginTop: '10px'}}>
                                    <div className="workmates">
                                        <div style={{width: '100px'}}>参与的同事</div>
                                        <a onClick={self.toSelectWorkmates}>请选择</a>
                                        <div className="count"
                                             style={{width: '100%'}}>{workmatesDesc}</div>
                                    </div>

                                </div>
                                <div className="attendee" style={{marginTop: '10px'}}>
                                    <div className="patients">
                                        <div style={{width: '100px'}}>参与的病患</div>
                                        <a onClick={self.toSelectPatients}>请选择</a>
                                        <div className="count"
                                             style={{width: '100%'}}>{patientsDesc}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-12 col-xs-12 col-sm-12">
                            <div className="create_btn to_create" onClick={self.save}>保存</div>
                        </div>
                    </div>
                </section>
            </div>);
    },
    selectWorkmates: function (list) {
        if ($.isArray(list)) {
            this.setState({"workmates": list});
        }
        PageActionCreators.changePage("detail.edit");

    },
    selectPatients: function (list) {
        if ($.isArray(list)) {
            this.setState({"patients": list});
        }
        PageActionCreators.changePage("detail.edit");

    },
    toEdit: function () {
        PageActionCreators.changePage("detail.edit");
    },
    render: function () {
        var page = this.state.page;
        if (page.indexOf("types") >= 0) {
            return (<Type selectType={this.selectType}/>);
        }
        if (page.indexOf("workmates") >= 0) {
            return <SelectAttender tag="workmate" userId={ScheduleStore.getUser().id} contacts={true} back={this.toEdit}
                                   selected={this.state.workmates} commit={this.selectWorkmates}/>
        }
        if (page.indexOf("patients") >= 0) {
            return <SelectAttender tag="patient" userId={ScheduleStore.getUser().id}  back={this.toEdit}
                                   selected={this.state.patients} commit={this.selectPatients}/>

        }
        //
        //if(page.indexOf("detail")>=0) {
        //    return <Detail />
        //}
        return this.renderEdit();
    },
});

module.exports = Edit;
