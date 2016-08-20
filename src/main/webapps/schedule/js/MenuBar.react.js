var React = require("react");
var ReactRouter = require('react-router');
var Link = ReactRouter.Link;

var MenuBar = React.createClass({
    render:function() {
        return(
            <div className="row">
                <div className="main-header">
                    <div className="ml" ><b><Link to={isNullOrEmpty(this.props.leftLink)?"/":this.props.leftLink }>{this.props._left?this.props._left:""}</Link></b></div>
                    <div className="mc" ><b>{this.props._title?this.props._title:"日程管理"}</b></div>
                    <div className="mr" ><b><Link to={isNullOrEmpty(this.props.moreLink)?"/":this.props.moreLink}>{this.props.more}</Link></b></div>
                </div>
            </div>
        );

    },
});

module.exports = MenuBar;
