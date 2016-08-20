var React = require("react");
var ScheduleStore = require("./ScheduleStore");
var ReactRouter = require('react-router');
var Link = ReactRouter.Link;
var IndexLink = ReactRouter.IndexLink
var List = require('./List.react');
var MenuBar = require('../MenuBar.react');
var Select2 = require("react-select2");

function getStateFromStores() {
    return {
        //recents: ScheduleStore.getRecents(),
    };
}
var wlanip = "https://120.76.168.214:6443";
var SelectAttender = React.createClass({
    everyAllMembers: [],
    singleAllMembers: [],
    singlePersonArr: [],
    jsonDepartIds: [],
    jsonAllKeShi: [],
    jsonUserIds: [],
    currentDepart: {},
    selected: [],
    prefix: "",
    members: [],
    getInitialState: function () {
        var data = {}
        if ($.isArray(this.props.selecteds) && this.props.selecteds.length > 0)
            data.selecteds = this.props.selecteds;
        else {
            if (this.props.tag != "patient") {
                var myself = {id: ScheduleStore.getUser().id, name: "自己"};
                data.selecteds = [myself];
                this.members = [];
                this.members.push(myself);
            }
        }
        if (!isNullOrEmpty(this.props.prefix))
            this.prefix = this.props.prefix;
        data.departListView = [];
        data.singleListView = [];
        data.everyListView = [];
        data.contactsView = [];
        return data;

    },
    componentDidMount: function () {
        if ($.isArray(this.props.selected) && this.props.selected.length > 0)
            this.selected = this.props.selected;
        else {
            if (this.props.tag != "patient") {
                var myself = {id: ScheduleStore.getUser().id, name: "自己"};
                this.selected = [myself.id];
                //ScheduleStore.queryRecents();
            }
        }
        this.selectFirst();
        this.initContacts();


    },
    componentWillUnmount: function () {
    },
    _onChange: function () {
        this.setState(getStateFromStores());
    },
    checkDepart: function (event) {
        //$(event.target).prop('checked', !($(event.target).checked));
    },
    selectFirst: function () {
        var self = this;
        var tag = this.props.tag;
        var url = wlanip;
        if (tag == "patient") {
            url += "/rest/patients/mine/v1/" + self.props.userId;
        } else {
            url += "/rest/doctors/mate/v1/" + self.props.userId;
            //url+="/rest/pc/doctors/" + self.props.userId;
        }
        getData(url, {}, function (data) {
                if (data.responseMsg == '1') {
                    var users = data.doctors;
                    var type = data.type;
                    var departs = data.departs;
                    if (self.props.tag == "patient") {
                        users = data.patients;
                    }
                    //如果是单科室
                    if (isNullOrEmpty(type) || type == 1) {
                        self.showUsers();
                        self.renderUsers(users);
                    } else {
                        self.showDepartment();
                        //循环
                        var departListView = [];
                        var i = 0;
                        _.each(departs, function (item) {
                            var id = item.id;
                            var name = item.name;
                            departListView.push((<li>
                                <label className="cks" role={id}>
                                    <input onClick={self.checkDepart} type="checkbox" name={self.prefix+"_keshiName"}
                                           value={"ALL_" + id}/>
                                    <b className="selects"><i></i></b></label>
                                <label onClick={function() {
                                    self.currentDepart.id = id;
                                    self.currentDepart.name = name;
                                            //var input_name = self.prefix+"-"+self.currentDepart.id+"-keshi-user";
                                    var index = _.indexOf($('[name='+self.prefix+"_keshiName"+']'),
                                    $('[value=ALL_'+id+']')[0])
                                    if(!$('[name='+self.prefix+"_keshiName"+']')[index].checked) {
                                        self.showEveryDepart();
                                    }
                                }} className="go_part3" htmlFor="form_part2"
                                       role={id} data-name={name}>
                                    <b className="jiantou">&#62;</b>
                                    <div className="depart_info">
                                        <span> {name }</span>
                                        <i> {"有" + item.number + "个同事" }</i>
                                    </div>
                                </label>
                            </li>));
                        });
                        self.setState({"departListView": departListView});
                        var input_name = self.prefix + "_keshiName";
                        var departList = $('[name=' + input_name + ']');
                        _.each(departList, function (t) {
                            var id = $(t).attr("value");
                            if (self.isSelected(id)) {
                                $(t).prop('checked', true);
                            } else {
                                $(t).prop('checked', false);
                            }
                        });
                    }

                } else {
                    alert('失败');
                }
            }, function (xhr, errorText, errorType) {
                alert('获取选择单科室同事的status是' + xhr.status + '，' + 'statusText是' + xhr.statusText);
            }
        );
    },
    showEveryDepart: function () {
        var self = this;
        var depart = this.currentDepart;
        if (depart != null && !isNullOrEmpty(depart.id)) {
            getData(wlanip + '/rest/ios/doctors/v1/' + depart.id + '/0', {}, function (data) {
                if (data.responseMsg == '1') {
                    var users = data.users;
                    self.renderUsers(users);
                } else {
                    alert('失败');
                }
            }, function (xhr, errorText, errorType) {
                alert('获取选择多科室同事的status是' + xhr.status + '，' + 'statusText是' + xhr.statusText);
            });
        }
    },
    renderUsers: function (users) {
        var self = this;
        self.showUsers();
        //var singleListView = [];
        //for (var i in users) {
        //    singleListView.push(self.getUserHtml(users[i]));
        //}
        self.setState({"singleListView": self.getUsersHtml(users)});
        self.checkedUsers();
    },
    checkedUsers: function () {
        var self = this;
        var input_name = self.prefix + "-" + self.currentDepart.id + "-keshi-user";
        var userList = $('[name=' + input_name + ']');
        _.each(userList, function (t) {
            var id = $(t).attr("value");
            if (self.isSelected(id)) {
                $(t).prop('checked', true);
            } else {
                $(t).prop('checked', false);
            }
        });
    },
    //获取单个用户的html
    getUserHtml: function (user) {
        var self = this;

        var b_toux = [];
        if (user.icon) {
            b_toux.push((
                <b className="toux" style={{display:"inline"}}><i><img style={{display:"inline"}}
                                                                       src={ user.icon }/></i></b>));
        } else {
            if (user.name.length > 3) {
                b_toux.push((<b className="toux" style={{display:"inline"}}><i
                    style={{display:"inline"}}>{ user.name.substring(3) }</i></b>));
            } else {
                b_toux.push((<b className="toux" style={{display:"inline"}}><i
                    style={{display:"inline"}}>{ user.name }</i></b>));
            }
        }
        var input_name = self.prefix + "-" + self.currentDepart.id + "-keshi-user";
        var view = (<li>
            <label forHtml={ user.id }>
                <input data-single="singlePerson" type="checkbox"
                       name={input_name} id={user.id} value={ user.id}
                       role={ user.name} style={{display:"inline"}}
                       onClick={function(event) {
                            //$('[name=' + input_name + ']').checked
                       }}/>
                        <span style={{display:"inline"}}>{b_toux} {user.name}<b
                            className="selects"><i></i></b></span>
            </label>
        </li>);
        return view;

    },
    commitUsers: function () {
        var self = this;
        var input_name = self.prefix + "-" + self.currentDepart.id + "-keshi-user";

        var keshiList = $('[name=' + self.prefix + "_keshiName" + ']');
        var userList = $('[name=' + input_name + ']');
        var self = this;
        _.each(keshiList, function (t) {
            var id = $(t).attr("value");
            if (t.checked) {
                if (!self.isSelected(id)) {
                    self.selected.push(id);
                }
            } else {
                self.removeSelected(id);
            }
        });
        _.each(userList, function (t) {
            var id = $(t).attr("value");
            if (t.checked) {
                if (!self.isSelected(id)) {
                    self.selected.push(id);
                }
            } else {
                self.removeSelected(id);
            }
        });

        _.each(userList, function (t) {
            $(t).prop('checked', false);
        });
        this.setState({"singleListView": ""});
        if (this.currentDepart == null || isNullOrEmpty(this.currentDepart.id)) {
            if ($.isFunction(this.props.commit))
                this.props.commit(this.selected);
            //alert("commitUser"+this.selected.length);
        } else {
            this.showDepartment();
        }

    },
    commitKeshi: function () {
        this.commitUsers();
        if ($.isFunction(this.props.commit))
            this.props.commit(this.selected);
        //alert("commitKeshi"+this.selected.length);

    },
    showDepartment: function () {
        $('.form_part2').removeClass('display_none');
        $('.form_part3.singleDepart').add('display_none');
    },
    showUsers: function () {
        $('.form_part2').addClass('display_none');
        $('.form_part3.singleDepart').removeClass('display_none');
    },
    allKeShiChk: function (event) {
        var $aksc = event.target;
        var akscked = event.target.checked;
        var departLis = $('[name=' + this.prefix + "_keshiName" + ']');
        var self = this;
        _.each(departLis, function (t) {
            if (akscked) {
                $(t).prop('checked', true);
            } else {
                $(t).prop('checked', false);
            }
        });
    },
    isSelected: function (_id) {
        return _.contains(this.selected, _id);
    },
    removeSelected: function (_id) {
        _.filter(this.selected, function (t) {
            t != _id
        });
    },
    keshiBack: function () {
        if ($.isFunction(this.props.back)) {
            this.props.back();
        }
    },
    userBack: function () {
        if (this.currentDepart == null || isNullOrEmpty(this.currentDepart.id)) {
            this.props.back();
        } else {
            this.showDepartment();
        }
    },
    initContacts: function () {
        var self = this;
        if (self.hasContacts()) {
            getData(wlanip + "/rest/schedule/member/v1/" + this.props.userId, {}, function (data) {
                if (data.responseMsg == "1") {
                    var members = data.users;
                    if ($.isArray(members)) {
                        self.members = self.members.concat(members);
                    }
                }
                self.setState({"contactsView": self.getUsersHtml(self.members)});
                self.checkedUsers();
            }, function (v1, v2, c3) {
                self.setState({"contactsView": self.getUsersHtml(self.members)});
                self.checkedUsers();
            });
        }
    },
    getUsersHtml: function (users) {
        var listView = [];
        var self = this;
        _.each(users, function (user) {
            listView.push(self.getUserHtml(user));
        });
        return listView;
    },
    hasContacts: function () {
        return !isNullOrEmpty(this.props.contacts) || this.props.contacts;
    },

    render: function () {
        var title = "";
        if (this.props.tag == "patient") {
            title = "选择接收的病人";
        } else {
            title = "选择接收的同事";

        }
        //<label>
        //    <input style={{left:"30px",position: "relative"}} name="myself" onClick={this.checkSelf} type="checkbox" className="myself"
        //           value={this.props.userId} defaultChecked/>
        //    <span style={{left:"90px",position: "relative"}}>自己</span>
        //</label>
        return (
            <div>

                <div style={{display:(this.hasContacts()?"block":"none")}}>
                    <div className="creat_con">
                        <div className="creat_form">
                            <div className="f_p form_part2">
                                <div className="top_info">
                                    <label onClick={this.keshiBack} className="back"
                                           htmlFor="form_part1">&#9665;</label>
                                    <label onClick={this.commitKeshi} className="ok" htmlFor="form_part1">确定</label>
                                    <span>常用联系人</span>
                                </div>
                            </div>
                            <div className="f_p form_part3">
                                <div className="select_con single_con trans02" style={{left:"0px",width:"100%"}}>
                                    <div className="select_con2 colleagues" style={{width:"100%"}}>
                                        <ul>
                                            {this.state.contactsView}

                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="creat_con">
                    <div className="creat_form">
                        <div className="f_p form_part2">
                            <div className="top_info">
                                <label style={{display:this.hasContacts()?"none":"block"}} onClick={this.keshiBack}
                                       className="back" htmlFor="form_part1">&#9665;</label>
                                <label style={{display:this.hasContacts()?"none":"block"}} onClick={this.commitKeshi}
                                       className="ok" htmlFor="form_part1">确定</label>
                                <span>选择科室</span>
                            </div>

                            <div className="checkall">
                                <label>
                                    <input onClick={this.allKeShiChk} type="checkbox" className="allKeShi" value="ALL"/>
                                <span className="checkallBtn">
                                    <b className="selects"><i></i></b>全选</span></label>
                            </div>

                            <div className="departs" id="departList">
                                <ul>
                                    {this.state.departListView}
                                </ul>
                            </div>

                        </div>

                        <div className="f_p form_part3 singleDepart">
                            <div className="top_info">
                                <label onClick={this.userBack} className="back" htmlFor="form_part1">&#9665;</label>
                                <label onClick={this.commitUsers} className="ok" htmlFor="form_part1">确定</label>
                                <span>{title}</span>
                            </div>

                            <input type="radio" id="select_singleTs" name="select_tg" defaultChecked/>
                            <div className="select_con single_con trans02" style={{left:"0px",width:"100%"}}>
                                <div className="select_con2 colleagues" style={{width:"100%"}}>
                                    <ul>
                                        {
                                            this.state.singleListView
                                        }
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    },
});
module.exports = SelectAttender;
