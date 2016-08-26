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
var Type = React.createClass({

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
    deleteType:function(type) {},
    selectType: function(type) {
        if($.isFunction(this.props.selectType))
        {
            this.props.selectType(type);
        }
    },
    addType:function() {
        var newType =  $("#new_type").val();
        if(newType=="") {
            alert("添加类型不能为空");
        }
        TypeStore.saveType(newType,this.addTypeSuccess);
    },
    addTypeSuccess:function() {
        $("#new_type").val("");
    },
    getTypeListHtml:function() {
        var self = this;
        var html = [];

        var list = this.state.types;
        _.each(list, function(t){
           html.push((
               <li className="row">
                <p onClick={function(){
                    self.selectType(t);
                }} className="col-md-10 col-xs-9 col-sm-10">
                    {t}
            </p>
            <span className="col-md-2 col-xs-3 col-sm-2" >
                <i onClick={function(){
                    //self.deleteType(t);
                    TypeStore.deleteType(t);
                }} className="fa fa-times" aria-hidden="true"></i>
            </span>
            </li>
           )); 
        });
        return html;
    },
    render:function() {
        return(
            <div>
                <ul>
                {this.getTypeListHtml()}
                </ul>
                <div className="col-md-12 col-xs-12 col-sm-12" style={{textAlign: "center"}}>
                   自定义: <input id="new_type" /> <p onClick={this.addType} style={{display: "inline"}} > 添加</p>
                </div>
            </div>
        );
    },
});

module.exports = Type;
