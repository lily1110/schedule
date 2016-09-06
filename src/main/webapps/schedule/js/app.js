var ReactRouter = require('react-router');
var Router = ReactRouter.Router;
var Route = ReactRouter.Route;
var browserHistory = ReactRouter.browserHistory;
var IndexRoute = ReactRouter.IndexRoute;
var React = require('react');
var ReactDOM = require('react-dom');
var Schedule = require('./Schedule.react');
var Calendar = require('./calendar/Calendar.react');
var Detail = require('./schedule/Detail.react');
var Edit = require('./schedule/Edit.react');
var List = require('./schedule/List.react');
var MySchedule = require('./schedule/MySchedule.react');
var All = require('./schedule/All.react');
var Search = require('./schedule/Search.react');
var Export = require('./schedule/Export.react');
var SelectAttender = require('./schedule/SelectAttender.react');
var Image = require('./schedule/Image.react');
//var Select2Demo = require('./schedule/Select2Demo.react');
var WorkmatesList = require('./schedule/WorkmatesList.react');
var PatientsList = require('./schedule/PatientsList.react');
window.React = React;


var routes = (
    <Route>
        <Route path="/" component={Schedule}>
            <IndexRoute component={Calendar} />
            <Route path="detail/:id" component={Detail} />
            <Route path="edit(/:id)" component={Edit} />
            <Route path="list/:tag" component={List} />
            <Route path="mine" component={MySchedule} />
            <Route path="all" component={All} />
            <Route path="search" component={Search} />
            <Route path="export" component={Export} />
            <Route path="workmates" component={WorkmatesList} />
            <Route path="schedule/patients/:scheduleId" component={PatientsList} />
            <Route path="patient/schedules/:patientId" component={List} />
            <Route path="workmate/schedules/:workmateId" component={List} />
        </Route>
        <Route path="attender" component={SelectAttender} />
        <Route path="img" component={Image} />

    </Route>
);


ReactDOM.render(<Router history={browserHistory}  routes={routes}/>, document.getElementById('body'));
