var React = require("react");
var ScheduleStore = require("./ScheduleStore");
var ReactRouter = require('react-router');
var Link = ReactRouter.Link;
var IndexLink = ReactRouter.IndexLink
var ScheduleList = require('./ScheduleList.react');
var MenuBar = require('../MenuBar.react');

function getStateFromStores() {
    return {};
}
var Search = React.createClass({
    getInitialState: function () {
        var data = getStateFromStores();
        var params={};
        if(this.props.params.tag=="mine") {
            params["tag"] = "mine";
        } else {
            params["tag"] = "mine";
        }
        params["content"]="all";
        params["tmpKey"]="";
        data["params"] = params;
        return data;
    },
    componentDidMount: function () {
        ScheduleStore.addChangeListener(this._onChange);

    },
    componentWillUnmount: function () {
        ScheduleStore.removeChangeListener(this._onChange);
    },
    _onChange: function () {
        this.setState(getStateFromStores());
    },
    onKeyChange: function (event) {
        this.setState({tmpKey: event.target.value});
    },
    toSearch: function () {
        var params = this.state.params;
        params["content"] = this.state.tmpKey;

        ScheduleStore.searchList(params);
    },
    mineFilter: function (event) {
        var params = this.state.params;
        params["tag"] = "mine";
        this.clickTab(event);
        this.setState({params: params});
    },
    byMeFilter: function (event) {
        var params = this.state.params;
        params["tag"] = "byMe";
        this.clickTab(event);
        this.setState({params: params});
    },
    clickTab:function(event) {
        $(".search div .tab").removeClass("select");
        $(event.target).addClass("select");
    },
    render: function () {
        //                    <List filter={this.state.filter} key={this.state.key} showType={false}></List>
        return (
            <div className="col-md-12 col-sm-12 col-xs-12 search">

                <div className="row">
                    <div className="col-md-12 col-sm-12 col-xs-12">
                        <MenuBar _left="首页" leftLink={"/"} moreLink={"/all"} more={"我的"} _title="搜索日程"></MenuBar>
                    </div>
                    <div className="col-md-12 col-sm-12 col-xs-12">
                        <input onChange={this.onKeyChange}/>
                        <a onClick={this.toSearch}>搜索</a>
                    </div>
                    <div className="col-md-3"></div>
                    <div onClick={this.mineFilter} className="col-md-3 col-sm-6 col-xs-6 tab select">
                        收到的日程
                    </div>
                    <div onClick={this.byMeFilter} className="col-md-3 col-sm-6 col-xs-6 tab">
                        我安排的日程
                    </div>
                    <div className="col-md-3"></div>
                    <ScheduleList params={this.state.params}  />
                </div>
            </div>
        );
    },
});
module.exports = Search;
