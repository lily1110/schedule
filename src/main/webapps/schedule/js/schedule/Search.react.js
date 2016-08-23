var React = require("react");
var ScheduleStore = require("./ScheduleStore");
var ReactRouter = require('react-router');
var Link = ReactRouter.Link;
var IndexLink = ReactRouter.IndexLink
var List = require('./List.react');
var MenuBar = require('../MenuBar.react');

function getStateFromStores() {
    return {};
}
var Search = React.createClass({
    getInitialState: function () {
        var data = getStateFromStores();

        if(this.props.params.filter=="mine") {
            data.filter = "mine";
        }

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
    searchInputChange: function (event) {
        this.setState({filter: event.target.value});
    },
    onKeyChange: function (event) {
        this.setState({tmpKey: event.target.value});
    },
    toSearch: function () {
        var params = {
            content:this.state.tmpKey
        }

        ScheduleStore.searchList(params);
    },
    mineFilter: function (event) {
        this.setState({filter: "mine"});
        this.clickTab(event);
    },
    byMeFilter: function () {
        this.setState({filter: "byMe"});
        this.clickTab(event);
    },
    clickTab:function(event) {
        $(".search div .tab").removeClass("select");
        $(event.target).addClass("select");
    },
    render: function () {
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
                    <List filter={this.state.filter} key={this.state.key} showType={false}></List>
                </div>
            </div>
        );
    },
});
module.exports = Search;
