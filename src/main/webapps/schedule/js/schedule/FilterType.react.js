var React = require("react");
var ReactRouter = require('react-router');
var TypeStore = require("./TypeStore");
function getStateFromStores() {
    return {
        list: TypeStore.getTypes(),
    };
}
var FilterType = React.createClass({
    getInitialState: function () {
        return getStateFromStores();
    },
    componentDidMount: function () {
        TypeStore.queryType();
    },
    componentWillUnmount: function () {
    },
    _onChange: function () {
        this.setState(getStateFromStores());
    },
    
    render: function () {
        var self = this;
        return (
            <div className='col-md-12 col-xs-12 col-sm-12'>
               
            </div>
        );

    },
});

module.exports = FilterType;
