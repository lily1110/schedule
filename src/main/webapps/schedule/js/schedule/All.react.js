var React = require("react");
var PageStores  =require("../page/stores/PageStores");
var ScheduleStore  =require("./ScheduleStore");
var ReactRouter = require('react-router');
var Link = ReactRouter.Link;
var IndexLink = ReactRouter.IndexLink;
var TypeStore = require("./TypeStore");
var List = require("./List.react");
var MenuBar = require("../MenuBar.react");

function getStateFromStores() {
    return {
        page:PageStores.getPage(),
        types: TypeStore.getTypes(),
        user: ScheduleStore.getUser(),
    };
}
var All = React.createClass({
    query:{},
    getInitialState:function() {
        return getStateFromStores();
    },
    componentDidMount: function () {
        PageStores.addChangeListener(this._onChange);
        ScheduleStore.addChangeListener(this._onChange);
        TypeStore.addChangeListener(this._onChange);
        TypeStore.queryType();
        this.query.id= this.state.user.id;
    },
    componentWillUnmount: function () {
        PageStores.removeChangeListener(this._onChange);
        ScheduleStore.removeChangeListener(this._onChange);
        TypeStore.removeChangeListener(this._onChange);
    },
    _onChange: function () {
        this.setState(getStateFromStores());
    },
    filterByType:function(t) {
        this.query.type = t;
        ScheduleStore.queryList(this.query);
    },
    typeHtml: function() {
        var self = this;
        var html=[];
        var items=[];
        var types = ["","全部日程"];
        types = types.concat(this.state.types);
        _.each(types,function(t){
            items.push((<option onClick={function(){
                self.filterByType(t);
            }}>{t}</option>));
        });
        html.push(
            <select className="form-control select2" id="schedule-timezone" default={types[1]}>
                {items}
            </select>);
        return html;
    },
    render:function() {
        var self = this;
        return(
            <div className='col-md-12 col-xs-12 col-sm-12' >
                <MenuBar _left="首页" leftLink={"/"} moreLink={"/search"} more={"搜索"} />

                <div className="row" style={{marginTop:'20px'}}>
                    <div  className="col-md-12 col-xs-12 col-sm-12">
                        <Link to="/list/other">
                            我为他人安排的
                        </Link>
                    </div>
                </div>
                <div className="row">
                    <div  className="col-md-12 col-xs-12 col-sm-12">
                        我参与的
                    </div>
                </div>
                <div className="row">
                    <List filter={"mine"} showType={true} export={true}></List>
                </div>
            </div>
        );

    },
});

module.exports = All;
