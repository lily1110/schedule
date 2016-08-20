var React = require("react");
var PageStores  =require("../page/stores/PageStores");
var ScheduleStore  =require("./ScheduleStore");
var ReactRouter = require('react-router');
var Link = ReactRouter.Link;
var IndexLink = ReactRouter.IndexLink;
var TypeStore = require("./TypeStore");
var host =  "https://120.76.168.214:6443";
var Select2 = require("react-select2");

function getStateFromStores() {
    return {
        types: TypeStore.getTypes(),
    };
}
var Export = React.createClass({
    getInitialState:function() {
        var data =  getStateFromStores();
        data.type = "全部日程";
        return data;
    },
    componentDidMount: function () {
        PageStores.addChangeListener(this._onChange);
        ScheduleStore.addChangeListener(this._onChange);
        TypeStore.addChangeListener(this._onChange);
        $('#start-date').datepicker({
            autoclose: true,
            format: "yyyy-mm-dd",
        });
        $('#end-date').datepicker({
            autoclose: true,
            format: "yyyy-mm-dd",
        });
        TypeStore.queryType();

    },
    componentWillUnmount: function () {
        PageStores.removeChangeListener(this._onChange);
        ScheduleStore.removeChangeListener(this._onChange);
        TypeStore.removeChangeListener(this._onChange);
    },
    _onChange: function () {
        this.setState(getStateFromStores());
    },
    typeChange:function(event) {
        this.setState({type: event.target.value});
    },
    typeHtml: function() {
        //var self = this;
        //var html=[];
        //var items=[];
        //var types = ["全部日程"];
        //types = types.concat(this.state.types);
        //_.each(types,function(t){
        //    items.push((<option>{t}</option>));
        //});
        //html.push(
        //    <select className="form-control select2" id="filter-type">
        //        {items}
        //    </select>);
        //return html;
        var types = this.state.types;
        if($.isArray(types)&&!_.contains(types,"全部日程")) {
            var t = ["全部日程"];
            types = t.concat(types);
        }
        return (<Select2
            defaultValue={"全部日程"}
            data={types}
            onChange={this.typeChange}
        />);
    },
    export: function() {
        var userId = ScheduleStore.getUser().id;
        var type = this.state.type;
        var startDesc = $("#start-date").val();
        var endDesc = $("#end-date").val();
        var start = new Date(startDesc).getTime();
        var end = new Date(endDesc).getTime();
        if(end<=start) {
            alert("请选择合法时间段");
            return;
        }
        window.open(host+"/rest/schedule/download/v1/"+userId+"/"+type+"/"+start+"/"+end);
        ///rest/schedule/download/v1/{id}/{type}/{start}/{end}
        //getData(host+"/rest/schedule/download/v1/"+userId+"/"+type+"/"+start+"/"+end,{},function(data){
        //    alert("导出成功");
        //},function(v1,v2,v3){})
    },
    render:function() {

        return(
            <div className='col-md-12 col-xs-12 col-sm-12' style={{marginTop:'20px'}}>
                <div className="row">
                    <div className='col-md-12 col-xs-12 col-sm-12' >
                        <h6>选出导出的类型</h6>
                        <div className="select2-types">{this.typeHtml()}</div>
                    </div>
                </div>

                <h6>选择导出的时间段</h6>
                <div className="row">
                    <div className="col-md-6 col-sm-6 col-xs-6">
                        <input id="start-date" type="text" className="form-control pull-right" placeholder="开始时间" />
                    </div>
                    <div className="col-md-6 col-sm-6 col-xs-6">
                        <input id="end-date" type="text" className="form-control pull-right"  placeholder="结束时间"/>
                    </div>

                </div>
                <div onClick={this.export} className="create_btn to_create" style={{marginTop: '30px'}}>导出</div>

                <section>
                    说明：
                    1我们会根据您选择的类别和时间段导出相应的您参与和为他人安排的日程
                    2导出的数据会以EXCEL的形式下载到电脑本地
                    3导出功能目前只支持电脑web端
                </section>
            </div>
        );

    },
});

module.exports = Export;
