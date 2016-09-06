var React = require("react");
var PageStores  =require("../page/stores/PageStores");
var ScheduleStore  =require("./ScheduleStore");
var ReactRouter = require('react-router');
var Link = ReactRouter.Link;
var IndexLink = ReactRouter.IndexLink;
var TypeStore = require("./TypeStore");

function getStateFromStores() {
    return {
        page:PageStores.getPage(),
        list:ScheduleStore.getList(),
        types: TypeStore.getTypes(),
    };
}
var List = React.createClass({
    query:{
    },
    getInitialState:function() {
        return getStateFromStores();
    },
    componentDidMount: function () {
        PageStores.addChangeListener(this._onChange);
        ScheduleStore.addChangeListener(this._onChange);
        TypeStore.addChangeListener(this._onChange);
        TypeStore.queryType();

        var self = this;
        $("#filter-type").change(function(){
            var checkText=$("#filter-type").find("option:selected").text();
            self.filterByType(checkText);
        });
        $(".select2").select2(
            {
                placeholder:"请选择",
                allowClear: true,
                closeOnSelect: true
            }
        );
        this.query.key = this.props.key;
        ScheduleStore.queryMyToDo();
    },
    componentWillUnmount: function () {
        PageStores.removeChangeListener(this._onChange);
        ScheduleStore.removeChangeListener(this._onChange);
        TypeStore.removeChangeListener(this._onChange);
    },
    _onChange: function () {
        this.setState(getStateFromStores());
    },
    filterByType:function(t) {
        this.query.type = t;
        ScheduleStore.queryList(this.query);
    },
    typeHtml: function() {
        if(!this.props.showType) {
            return "";
        }
        var self = this;
        var html=[];
        var items=[];
        var types = ["全部日程"];
        types = types.concat(this.state.types);
        _.each(types,function(t){
            items.push((<option>{t}</option>));
        });
        html.push(
            <select className="form-control select2" id="filter-type">
                {items}
            </select>);
        return html;
    },

    render:function() {
        var list = this.state.list;
        //$(".content-wrapper").css("display","none");
        //$("#events").css("display","block");
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
        //$("#eventsList").html(_html)
        //<div><input onChange={this.searchInputChange} placeholder="搜索条件"/>   <a onClick={this.searchSchedules}>  搜索 </a> </div>

        var exportHtml=[];
        if(this.props.export) {
            exportHtml.push((<Link to="/export"><div className="exportBtn">导出</div></Link>));
        }
        var otherHtml = [];
        if(!isNullOrEmpty(this.props.params) && this.props.params.tag == "other") {
            otherHtml.push((<Link to="/workmates">他人全部日程</Link>));
        }
        return(
            <div className='col-md-12 col-xs-12 col-sm-12' style={{marginTop:'20px'}}>
                <div>{exportHtml}</div>
                <div>{this.typeHtml()}</div>
                <div>{otherHtml}</div>
                <div>{_html}</div>
            </div>
        );

    },
});

module.exports = List;
