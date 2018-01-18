import React, {Component} from 'react';
import { Link } from 'react-router-dom';
import { Spin, Layout, List, Row, Col, Affix, Tabs, Button, Tag, Select, Pagination, Input } from 'antd';
import dateformat from 'dateformat';
import FeedbackApi from './FeedbackApi.js';

import './style.css';

class FeedbacksView extends Component {
    query = { }
    state = { feedbacks: { docs: [], total: 0, page: 1, limit: 1},
              filterData: [],
              filterFetching: false
            }
    componentDidMount() {
        this.paginate(1);
    }

    paginate(page, pageSize) {
        FeedbackApi.list(this.query, page).then((function(data) {
            this.setState(Object.assign({}, this.state, {feedbacks: data}));
        }).bind(this));
    
    }

    fetchTags(value) {
        this.setState(Object.assign({}, this.state, {filterFetching: true}));
        FeedbackApi.tags(value).then((function(tags) {
            this.setState(Object.assign({}, this.state, {filterFetching: false, filterData: tags}));       
        }).bind(this));
    }

    filterOnChange(value) {
        this.setState(Object.assign({}, this.state,
                    {filterValue: value, filterFetching: false}));
        
        this.query['filters'] =  value;
        this.paginate(1);
    }

    textSearch(value) {
        this.query['q'] = value;
        this.paginate(1);
    }

    render() {
        var feedbackItems = this.state.feedbacks.docs.map((f)=>{
            return <FeedbackItem data={f} key={f.feedbackKey} />;
        });

        const { total,page, limit,docs } = this.state.feedbacks;
        return (
            <Layout>
                <Layout.Content style={{background: '#fff'}}>
                    <PageHeader count={ (page-1)*limit + docs.length } total={ total }
                        filterValue = { this.state.filterValue }
                        filterOnChange = { this.filterOnChange.bind(this) }
                        filterFetchTags = { this.fetchTags.bind(this) }
                        textSearch = { this.textSearch.bind(this) }
                        filterFetching = { this.state.filterFetching }
                        filterData = { this.state.filterData }
                        />
                    <List itemLayout="vertical" style={{padding: '24px'}} 
                        footer = { <Pagination className="pull-right" size="small" total={ total } showQuickJumper 
                            onChange = { this.paginate.bind(this) }/> }>
                        { feedbackItems }
                    </List>
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


var PageHeader = (props) => {
 return (
        <Row>
            <Row type="flex" justify="space-between" style={{ padding: '20px 32px', border: 'solid 1px #ececec' }}>
                <Col span={15}>
                    <h2>Feedback</h2>
                    <div className="App-textMeta">Recent Feedbacks.</div>
                    <div className="App-textMeta">{props.count} / {props.total}</div>
                </Col>
            </Row>
            <Row type="flex" justify="space-between" style={{ padding: '32px' }}>
                <Col span={17}>
                    <Row style={{lineHeight: '30px'}}>
                        <Col span={3}>Filter By: </Col>
                        <Col span={20}>
                            <Select
                                mode="multiple"
                                labelInValue = { false }
                                value={props.filterValue}
                                notFoundContent={props.filterFetching? <Spin size="small" />: null}
                                filterOption = {false}
                                onSearch = { props.filterFetchTags }
                                onFocus = { props.filterFetchTags }
                                onChange = { props.filterOnChange }
                                placeholder="-select-" 
                                style={{ minWidth: 180 }}>
                                
                                <Select.OptGroup key = "User Rating">
                                    { [5,4,3,2,1].map((d) => <Select.Option key={"rating:" + d} title={"rating: " + d}>
                                        { <Stars key={"rating:"+d} count={d} />}
                                    </Select.Option>)}
                                </Select.OptGroup>
                                <Select.OptGroup key = "Labels">
                                    { props.filterData.map((d)=> <Select.Option key={d}>{d}</Select.Option>)}
                                </Select.OptGroup>
                            </Select>
                        </Col>
                    </Row>
                </Col>
                <Col span={7}>
                    <Input.Search placeholder="Search"
                        className="pull-right App-textMeta"
                        style={{width: 200}}
                        onSearch={ props.textSearch }
                         />
                </Col>
            </Row>
        </Row>
    );
};

var FeedbackItem = (props) => {
    var feedback = props.data;

    return (
        <List.Item extra={ <div style={{ width: 80 }}> { dateformat(feedback.updated, 'mmm d, yyyy') } </div> } >
            <List.Item.Meta title={ feedback.emailId }
                description = { <FeedbackItemMeta rating={feedback.rating} tags={feedback.tags}/> } />
                { feedback.feedbacktext }
        </List.Item>      
    );
};

var FeedbackItemMeta = (props) => {
    var tags = props.tags,
        ratingStars = [];
    
    for(var i=0; i < props.rating; i+=1) ratingStars.push(<i key={(new Date()).getTime() + "_star_"+i} className="fa fa-star Feedback-ratingStar" />);

    return (
        <div>
            { tags.map((t)=> { return (<Tag key={t} closable={ false }> { t } </Tag>); }) } 
            { ratingStars }
        </div>
    );
};

var Stars = (props) => {
    var stars = [];
    for (var i = 0; i < props.count; i++) {
        stars.push(<i key={props.key + i} className="fa fa-star" style={{fontSize: 12, color: 'rgb(242,181,54)'}}/>);
    }

    return (<span>{ stars } </span>)
}
export default FeedbacksView;

