var React = require("react");

var AttenderCheckbox = React.createClass({
    componentWillMount: function() {
      console.log("cwd");  
    },
    click:function() {
        if(this.props.checked) {
            if($.isFunction(this.props.not)) {
                this.props.not(this.props.user);
            }
        }
        else {
            if($.isFunction(this.props.check)) {
                this.props.check(this.props.user);
            }
        }
    },
    render:function() {
        var user = this.props.user;
        var self = this;
        var checked = this.props.checked?"block":"none";
        var b_toux = [];
        if (user.icon) {
            b_toux.push((
                <b className="toux" style={{display:"inline"}}><i>
                <img style={{display:"inline"}} src={ user.icon }/></i></b>));
        } else {
            if (user.name.length > 3) {
                b_toux.push((<b className="toux" style={{display:"inline"}}><i
                    style={{display:"inline"}}>{ user.name.substring(3) }</i></b>));
            } else {
                b_toux.push((<b className="toux" style={{display:"inline"}}><i
                    style={{display:"inline"}}>{ user.name }</i></b>));
            }
        }
        
        return (<li>
            <label forHtml={ user.id }>
                        <span onClick={this.click} style={{display:"inline"}}>{b_toux} {user.name}
                        <b className="selects"><i style={{display:checked}}></i></b></span>
            </label>
        </li>);

    },
});

module.exports = AttenderCheckbox;
