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
        data.filter = "mine";
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
    mineFilter: function () {
        alert("mine");
        this.setState({filter: "mine"});
    },
    byMeFilter: function () {
        alert("byMe");
        this.setState({filter: "byMe"});
    },
    render: function () {
        return (
            <div className="col-md-12 col-sm-12 col-xs-12">

                <div className="row">
                    <div className="col-md-12 col-sm-12 col-xs-12">
                        <MenuBar _left="首页" leftLink={"/"} moreLink={"/all"} more={"我的"} _title="搜索日程"></MenuBar>
                    </div>
                    <div className="col-md-12 col-sm-12 col-xs-12">
                        <input onChange={this.onKeyChange}/>
                        <a onClick={this.toSearch}>搜索</a>
                    </div>
                    <div className="col-md-3"></div>
                    <div onClick={this.mineFilter} className="col-md-3 col-sm-6 col-xs-6">
                        收到的日程
                    </div>
                    <div onClick={this.byMeFilter} className="col-md-3 col-sm-6 col-xs-6">
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
