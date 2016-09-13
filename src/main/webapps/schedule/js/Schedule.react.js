var React = require("react");
var ReactRouter = require('react-router');
var Link = ReactRouter.Link;
var IndexLink = ReactRouter.IndexLink;
var Schedule = React.createClass({
    render: function () {
        return (
            <div>
                <aside className="main-sidebar">
                    <section className="sidebar">
                        <ul className="sidebar-menu">
                            <li className="treeview">
                                <IndexLink activeClassName="on" to="/">
                                    <i className="fa fa-laptop"></i>
                                    <span>首页</span>
                                </IndexLink>
                            </li>
                            <li className="treeview">
                                <Link to="/edit">
                                    <i className="fa fa-laptop"></i>
                                    <span>创建日程</span>
                                </Link>
                            </li>
                            <li className="treeview">
                                <a>
                                    <i className="fa fa-laptop"></i>
                                    <span>未处理日程</span>
                                    <span className="pull-right-container">
                                      <i className="fa fa-angle-left pull-right"></i>
                                    </span>
                                </a>
                                <ul className="treeview-menu">
                                    <li><Link to="/list/todo"><i className="fa fa-circle-o"></i> 我参与的日程</Link></li>
                                    <li><Link to="/list/todo"><i className="fa fa-circle-o"></i> 我安排的日程</Link></li>
                                </ul>
                            </li>
                            <li className="treeview">
                                <Link to="/">
                                    <i className="fa fa-laptop"></i>
                                    <span>全部日程</span>
                                    <span className="pull-right-container">
                                      <i className="fa fa-angle-left pull-right"></i>
                                    </span>
                                </Link>
                                <ul className="treeview-menu">
                                    <li><Link to="/list/mine"><i className="fa fa-circle-o"></i> 我参与的日程</Link></li>
                                    <li><Link to="/list/other"><i className="fa fa-circle-o"></i> 我安排的日称</Link></li>
                                </ul>
                            </li>
                            <li className="treeview">
                                <Link activeClassName="on" to="/workmates">
                                    <i className="fa fa-laptop"></i>
                                    <span>他人日程</span>
                                </Link>
                            </li>
                            <li className="treeview">
                                <Link activeClassName="on" to="/search">
                                    <i className="fa fa-laptop"></i>
                                    <span>搜索</span>
                                </Link>
                            </li>
                            <li className="treeview">
                                <Link to="/export">
                                    <i className="fa fa-laptop"></i>
                                    <span>导出</span>
                                </Link>
                            </li>

                        </ul>
                    </section>
                </aside>
                <div className="content-wrapper">
                    <div className="row">
                        {this.props.children}
                    </div>
                </div>
            </div>);
    },
});

module.exports = Schedule;
