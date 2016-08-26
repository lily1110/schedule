var React = require("react");
var ScheduleStore = require("./ScheduleStore");
var ReactRouter = require('react-router');
var Link = ReactRouter.Link;
var IndexLink = ReactRouter.IndexLink
var List = require('./List.react');
var MenuBar = require('../MenuBar.react');
var Select2 = require("react-select2");
var AttenderCheckbox = require("./AttenderCheckbox.react");
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
    selecteds: [],
    prefix: "",
    members: [],
    mates:[],
    getInitialState: function () {
        var data = {}
        var t = [];

        if ($.isArray(this.props.selecteds) && this.props.selecteds.length > 0) {
            var ids=[];
            _.each(this.props.selecteds,function(t) {
                if(t!=null&&!isNullOrEmpty(t.id)) {
                    ids.push(t.id);
                }
            });
            this.selecteds = ids;
        }
        else {
            if (this.props.tag != "patient") {
                var myself = {id: ScheduleStore.getUser().id, name: "自己"};
                this.selecteds=[myself.id];
                this.members = [myself];
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
        if ($.isArray(this.props.selected) && this.props.selected.length > 0) {
           this.selecteds = this.props.selected;
        }
        this.selectFirst();
        this.initContacts();
    },
    componentWillUnmount: function () {
    },
    _onChange: function () {
        this.setState(getStateFromStores());
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
                    self.mates = users;
                    self.renderMates();

                } else {
                    alert('失败');
                }
            }, function (xhr, errorText, errorType) {
                alert('获取选择单科室同事的status是' + xhr.status + '，' + 'statusText是' + xhr.statusText);
            }
        );
    },

    renderMates: function () {
        this.setState({"singleListView": this.getUsersHtml(this.mates)});
    },
    selectUser:function(user) {
        if(!this.isSelected(user.id)) {
            var l = this.selecteds;
            l.push(user.id);
            this.renderAll();
        }

    },
    //获取单个用户的html
    getUserHtml: function (user) {
        var self = this;
        var checked=this.isSelected(user.id);
        return (<AttenderCheckbox 
                user={user}
                checked={checked}
                check={this.selectUser}
                not={this.removeSelected}
                />
            );

    },
    commitUsers: function () {
        this.props.commit(this.selecteds);
    },
    isSelected: function (_id) {
        return _.contains(this.selecteds, _id);
    },

    removeSelected: function (user) {
        var l = _.filter(this.selecteds, function (t) {
            return t != user.id;
        });
        this.selecteds=l;
        this.renderAll();
    },
    
    userBack: function () {
        this.props.back();
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
                self.renderContacts();
            }, function (v1, v2, c3) {
                self.renderContacts();
            });
        }
    },

    renderContacts:function() {
        this.setState({"contactsView": this.getUsersHtml(this.members)});

    },
    renderAll:function() {
        this.renderMates();
        this.renderContacts();
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
        var contactsTitle ="";
        var contactsView="";
        if (this.props.tag == "patient") {
            title = "选择接收的病人";
        } else {
            title = "选择接收的同事";
            contactsTitle="常用联系人";
            contactsView = this.state.contactsView;
        }

        return (
            <div>
                <div className="creat_con">
                    <div className="creat_form">
                        <div className="f_p form_part3 singleDepart">
                            <div className="top_info">
                                <label onClick={this.userBack} className="back" htmlFor="form_part1">&#9665;</label>
                                <label onClick={this.commitUsers} className="ok" htmlFor="form_part1">确定</label>
                            </div>

                            <div className="select_con single_con trans02" style={{left:"0px",width:"100%"}}>
                                <div className="select_con2 colleagues" style={{width:"100%"}}>
                                    <span>{contactsTitle}</span>
                                   <ul>
                                            {contactsView}

                                    </ul>
                                </div>  
                                <div className="select_con2 colleagues" style={{width:"100%"}}>
                                    
                                <span>{title}</span>
                                    

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
