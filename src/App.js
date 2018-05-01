import React, { Component } from 'react';
import { CreateCampaignView, ListSurvey } from './survey';
import SettingsView from './settings';
import UserApi from './user';
import FeedbacksView from './feedback';
import { HashRouter, Route, Switch, Link } from 'react-router-dom';
import { Layout, Menu, Affix, Select, Alert } from 'antd';
import fetchIntercept from 'fetch-intercept';

import myintro from './myintro.js';

// styles
import 'font-awesome/css/font-awesome.min.css';
import 'antd/dist/antd.css';
import '../node_modules/intro.js/minified/introjs.min.css';
import './App.css';

class App extends Component {
  state = { me: {}, rootRoute: '' }
  constructor() {
    super();
    fetchIntercept.register({
        response: function(response) {
            if (response.redirected) {
                window.location = response.url;
            }
            return response;
        }
    });

  }

  componentDidMount() {
    UserApi.me().then((function(user) {
        myintro.firstLogin = user.firstLogin;
        window.mixpanel.identify(user.id);

        let msg;
        if (user.license.plan === 'BASIC') {
            let plus30Days = new Date(user.license.started);
            plus30Days.setDate(plus30Days.getDate() + user.license.limitDays);
            const remaining =  Math.floor((plus30Days - new Date()) / (24*60*60*1000));
            
            if (remaining > 30) {
                msg = 'Your free trial period is exhausted. In order to continue user Outreech upgrade plan.';
            } else {
                msg = 'Your free trial will end in ' + remaining + ' days.';
            }
        }
        this.setState(Object.assign({}, this.state, 
                    {
                        me: user, 
                        freeTrialMessage: msg,
                        rootRoute: user.firstLogin? (<Route exact path="/" component={ SettingsView } />):
                                 (<Route exact path="/" component={ FeedbacksView } />)
                    }));



        // identify user to Freshchat
        window.fcWidget.init({
            token: "f8a997dc-1d8d-40a8-96b9-54357d47fdb4",
            host: "https://wchat.freshchat.com",
            externalId: user.id,
            firstName: user.name,
            lastName: user.lname,
            email: user.username
        });

    }).bind(this));
  }

  render() {
    return (
      <div className="App" data-me = { JSON.stringify(this.state.me) } >
        <HashRouter>
            <Layout>
                <Layout.Header className="App-header">
                { /*<Link to="#"><AppLogo className="App-logo" /></Link> */}
                    <WorkspaceActions user={this.state.me} className="App-userActions" style={{width: 128, marginTop: 15, color: '#fff', marginLeft: 100}}/>
                    <UserActions user={this.state.me} className="pull-right App-userActions" style={{width: 128, marginTop: 15, color: '#fff'}}/>
                </Layout.Header>


                <Layout>
                    <Layout.Sider width={ 165 } style={{backgroundColor: 'rgb(246, 246, 246)'}}>
                        <Affix>
                            <Menu className = "App-sideNav" defaultSelectedKeys= { ["feedbacks"] } >
                                <Menu.Item key="feedbacks"><Link to="/feedbacks">User Reviews</Link></Menu.Item>
                                <Menu.Item key="surveys"><Link to="/surveys">Campaigns</Link></Menu.Item>
                                <Menu.Item key="settings"><Link to="/settings" >Settings</Link></Menu.Item>
                            </Menu>
                        </Affix>         
                    </Layout.Sider>
                    <Layout.Content className="App-body" >
                    { this.state.freeTrialMessage && (<Alert type="info" message={
                            this.state.freeTrialMessage 
                        } banner={true} closable={true} />) }
                        <Switch>

                            { this.state.rootRoute }
                            <Route exact path="/feedbacks" component={ FeedbacksView } />
                            <Route exact path="/surveys" component={ ListSurvey } />
                            <Route exact path="/surveys/new" component={ CreateCampaignView } />
                            <Route exact path="/surveys/:surveyKey/edit" component={ CreateCampaignView } />
                            <Route exact path="/settings" component={ SettingsView } />
                        </Switch>
                    </Layout.Content>
                </Layout>
            </Layout>
        </HashRouter>
     </div>
    );
  }
};


var UserActions = (props) => {
    return (
        <Select value={ props.user.name } {...props}>
            <Select.Option value="Logout"><a href="/logout">Logout</a></Select.Option>
        </Select>
    );        
};

var WorkspaceActions = (props) => {
    return (
        /**<Select value={ props.user.company } {...props}>
            <Select.OptGroup key={"Company"}>
                <Select.Option value={ props.user.company }>{ props.user.company }</Select.Option>
            </Select.OptGroup>
        </Select>
        **/

        <span {...props }> { } </span>
    ); 
};


var AppLogo = (props) => {
    return <img className={props.className} src="data:image/png;base64,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" />
};


export default App;

