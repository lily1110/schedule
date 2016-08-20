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
        list: ScheduleStore.getOthers(),
    };
}
var WorkmatesList = React.createClass({
    query:{},
    getInitialState:function() {
        return getStateFromStores();
    },
    componentDidMount: function () {
        PageStores.addChangeListener(this._onChange);
        ScheduleStore.addChangeListener(this._onChange);
        ScheduleStore.queryOther();
    },
    componentWillUnmount: function () {
        PageStores.removeChangeListener(this._onChange);
        ScheduleStore.removeChangeListener(this._onChange);
    },
    _onChange: function () {
        this.setState(getStateFromStores());
    },

    render:function() {
        var list = this.state.list;
        var _html = [];
        _.each(list, function(t){
            _html.push((<div><Link to={"/workmate/schedules/"+t.id}>{t.name}</Link></div>));
        });
        return(
            <div className='col-md-12 col-xs-12 col-sm-12' style={{marginTop:'20px'}}>
                <div>他人日程</div>
                <div>{_html}</div>
            </div>
        );

    },
});

module.exports = WorkmatesList;
