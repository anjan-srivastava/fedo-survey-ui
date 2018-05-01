import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import dateformat from 'dateformat';
import { Layout, List, Button, Pagination, Row, Col, Tabs, Affix } from 'antd';
import SurveyApi from './SurveyApi.js';

import myintro from '../myintro.js';

// styles
import './ListSurvey.css';

class ListSurvey extends Component {
    constructor(props) {
        super(props);
        this.state = {
            surveys: { docs:[], total: 0, page: 1, limit: 10 }
        };    
    }

    componentDidMount() {
        this.paginate(1, 10).then(myintro);
    }

    paginate(page, pageSize) {
        return SurveyApi.list(page).then((function(data) {
            this.setState({surveys: data});
        }).bind(this));
    }

    render() {
        var surveyList = this.state.surveys.docs.map((d,idx) => {
            if (idx === 0) {
                return <SurveyEntry data={d} 
                        key={d.surveyKey} data-step="3" data-intro="Setup your review email campaign here. Your users will fill the reviews from the email they receive from one of these campaigns."/> ;
            }

            return <SurveyEntry data={d} 
                    key={d.surveyKey}/> ;
        });
        const { page, limit, docs, total } = this.state.surveys;
        const seenSofar = (page-1) * limit + docs.length;
        
        return (
            <Layout>
            <Layout.Content style={{background: '#fff'}}>
            <div className="List-Survey">
                <SurveyHeader count={seenSofar} total={total}/>
                <Row>
                    <List itemLayout = "vertical" size="large" style={{padding: '40px'}} 
                        footer = { <Pagination className="pull-right" size="small"
                                    onChange={ this.paginate.bind(this) }
                                    total={ this.state.surveys.total }
                                    showQuickJumper /> } >
                        { surveyList }   
                    </List>
                </Row>
            </div>
            </Layout.Content>
            <Layout.Sider width= { 350 } >
                    <Affix>
                        <div style = {{ height: '100vh', background: '#fff'}} className="Feedback-Sider-Right" >
                        </div>
                    </Affix>
                </Layout.Sider>
            </Layout>
        );
    }

}

var SurveyHeader = (props) => {
    return (
        <Row type="flex" justify="space-between" style={{ padding: '32px', border: 'solid 1px #ececec' }}>
            <Col span={18}>
                <h2>Email Campaigns</h2>
                <div className="App-textMeta">You can set new email campaign from here. Send mails to specific users or in masses. All the user replies to these emails can be accessed in the Reviews section.</div>
                <div className="App-textMeta">{ props.count } / { props.total } {'Campaigns'} </div>
            </Col>
            <Col span={5}>
                <Link to="/surveys/new"><Button type="primary" ghost = {true} className="pull-right" onClick = { () => window.mixpanel.track('Initiate Campaign') }
                    data-step="4" data-intro="Let's start off by setting up your first email campaign. Or can simply edit the sample campaign we have provided.">Create Campaign</Button></Link>
            </Col>
        </Row>
    );
};

var SurveyEntry = (props) => {
    var surveyData = props.data,
        sampleStyle = {display: 'none'};
    if (surveyData.sample) sampleStyle = {display:'inline', marginLeft: 15};
    return (
        <List.Item {...props}> 
            <List.Item.Meta title={ <span><Link to={ "/surveys/" + surveyData.surveyKey + '/edit'} style={{color:'#1890ff'}}>{ surveyData.title } </Link> <span style={sampleStyle} className={'Feedback-displayed'}>( SAMPLE CAMPAIGN )</span></span>} />
            <Row type="flex" justify="space-between" style={{color: 'rgba(28, 46, 61, .4)'}}>
                <Col span={13} style={{wordWrap: 'break-word'}}>{surveyData.description}</Col>
                <Col span={8}><span style={{fontSize:11, float:'right'}}>Email | {"Created by " + surveyData.createdBy.name} | {dateformat(surveyData.created, "mmm d, yyyy")}</span></Col>
            </Row>
        </List.Item>        
    );
};

export default ListSurvey;

