var React = require("react");
var PageStores  =require("../page/stores/PageStores");
var ScheduleStore  =require("./ScheduleStore");
var ReactRouter = require('react-router');
var Link = ReactRouter.Link;
var IndexLink = ReactRouter.IndexLink

function getStateFromStores() {
    return {
        page:PageStores.getPage(),
    };
}
var Patients = React.createClass({

    getInitialState:function() {
        return getStateFromStores();
    },
    componentDidMount: function () {
        PageStores.addChangeListener(this._onChange);
        ScheduleStore.addChangeListener(this._onChange);
        ScheduleStore.queryPatients();
    },
    componentWillUnmount: function () {
        PageStores.removeChangeListener(this._onChange);
        ScheduleStore.removeChangeListener(this._onChange);
    },
    _onChange: function () {
        this.setState(getStateFromStores());
    },

    render:function() {
        return(
            <div></div>
        );

    },
});

module.exports = Patients;
