var React = require("react");
var TypeStore  =require("./TypeStore");
var ReactRouter = require('react-router');
var Link = ReactRouter.Link;
var IndexLink = ReactRouter.IndexLink

function getStateFromStores() {
    return {
        types: TypeStore.getTypes(),
    };
}
var SelectType = React.createClass({
    getInitialState:function() {
        return getStateFromStores();
    },
    componentDidMount: function () {
        TypeStore.addChangeListener(this._onChange);
        TypeStore.queryType();
    },
    componentWillUnmount: function () {
        TypeStore.removeChangeListener(this._onChange);
    },
    _onChange: function () {
        this.setState(getStateFromStores());
    },
    selectType: function(type) {
        if($.isFunction(this.props.selectType))
        {
            this.props.selectType(type);
        }
    },
    render:function() {
        var self = this;
        var items=[];
        var types = ["全部日程"];
        types = types.concat(this.state.types);
        _.each(types,function(t){
            items.push((<option>{t}</option>));
        });
        return(
            <select className="form-control select2" id="filter-type">
                {items}
            </select>
        );
    },
});

module.exports = SelectType;