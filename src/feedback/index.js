import React, {Component} from 'react';
import { Link } from 'react-router-dom';
import { Spin, Layout, List, Row, Col, Affix, Tabs, Button, Tag, Select, Pagination, Input, notification } from 'antd';
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

    handleFeedbackUpdate(newFeedback, idx) {
        var updatedFeedbacks = this.state.feedbacks;
        updatedFeedbacks[idx] = newFeedback;
        this.setState(Object.assign({}, this.state, {feedbacks: updatedFeedbacks}));
    }

    render() {
        var feedbackItems = this.state.feedbacks.docs.map(((f, idx)=>{
            var that = this, handler = (function(idx) {
                return (newFeedback) => that.handleFeedbackUpdate(newFeedback, idx);
            }(idx));

            return <FeedbackItem data={f} key={f.feedbackKey} onUpdate={ handler } />;
        }).bind(this));

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
                    <List itemLayout="vertical" style={{padding: '24px 0'}} 
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
                <Col span={24}>
                    <h2>Reviews</h2>
                    <div className="App-textMeta">You can view all the reviews that users have replied with from the email campaigns that are running. Use the filters to view any specific reviews that you want to see.</div>
                    <div className="App-textMeta">{props.count} / {props.total}  { 'Reviews' }</div>
                </Col>
            </Row>
            <Row type="flex" justify="space-between" style={{ padding: '32px' }}>
                <Col span={17}>
                    <Row style={{lineHeight: '30px'}}>
                        <Col span={4}><span style={{margin: 5}}>Filter By: </span></Col>
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
    var publishBtn,
        handlePublish = function(isPublished) {
            var fn;
            if (isPublished) fn = FeedbackApi.unpublish;
            else fn = FeedbackApi.publish;

            fn(feedback.feedbackKey)
            .then(function(res) {
                var title, fn;
                if (res.success) { 
                    title = "Success";
                    fn = notification.success;
                    // update model
                    if (isPublished) feedback.isPublished = false;
                    else feedback.isPublished = true;
                    
                    props.onUpdate(feedback);
                } else {
                    title = "Error";
                    fn = notification.error;
                }

                fn({
                    message: title,
                    description: res.msg
                });
            });
    };

    let itemPublishedClass = "",
        displayedStyle = { display: 'none' };
    if (feedback.isPublished) {
        publishBtn = (<Button className="fedoBtn faded" type="primary" size="small" onClick={ () => handlePublish(true) }>Stop showing on website</Button>);
        itemPublishedClass = "Feedback-Review-Published";
        displayedStyle = { display: 'inline', marginLeft: 15};
    } else {
        publishBtn = (<Button className="fedoBtn" type="primary" size="small" onClick={ () => handlePublish(false) }>Display on website</Button>);
    }

    return (
        <List.Item style={{padding: 24}} className={ itemPublishedClass } extra={ <div style={{ position: 'relative', width: 160, height: '100%', textAlign: 'right', paddingRight: 10}}> 
            <div style={{position: 'absolute', bottom: 0, right: 10 }}>{ dateformat(feedback.updated, 'mmm d, yyyy') } </div> { publishBtn } </div> }
                actions = { [<FeedbackItemMeta tags={feedback.tags} updateTimestamp={feedback.updated}/>] } >
            <List.Item.Meta title={ <div><span>{ feedback.emailId }</span><Rating rating={feedback.rating} /><span style={ displayedStyle } className={'Feedback-displayed'}>( DISPLAYED )</span></div> } />
                <span className='Feedback-contentText'>{ feedback.feedbacktext }</span>
        </List.Item>      
    );
};

var Rating = (props) => {
    var ratingStars = [];
    for(var i=0; i < props.rating; i+=1) ratingStars.push(<i key={(new Date()).getTime() + "_star_"+i} className="fa fa-star Feedback-ratingStar" />);
    return (
        <span style={{marginLeft: 15}}>
            { ratingStars }
        </span>        
    );
};

var FeedbackItemMeta = (props) => {
    var tags = props.tags;
    

    return (
        <div>
            { tags.map((t)=> { return (<Tag key={t} closable={ false }> { t } </Tag>); }) }
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

