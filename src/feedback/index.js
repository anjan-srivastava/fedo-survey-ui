import React, {Component} from 'react';
import { Link } from 'react-router-dom';
import { Spin, Layout, List, Row, Col, Affix, Tabs, Button, Tag, Select, Pagination, Input, 
    Modal, Alert, Icon, notification, message } from 'antd';
import dateformat from 'dateformat';

import FeedbackApi from './FeedbackApi.js';
import SettingsApi from '../settings/SettingsApi.js';
import myintro from '../myintro.js';

import './style.css';

class FeedbacksView extends Component {
    query = { }
    state = { feedbacks: { docs: [], total: 0, page: 1, limit: 1},
              filterData: [],
              filterFetching: false
            }
    componentDidMount() {
        this.paginate(1).then(() => myintro("/surveys"));
    }

    paginate(page, pageSize) {
        return FeedbackApi.list(this.query, page).then((function(data) {
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

    showSnippetModal() {
        SettingsApi.getWidgetLink()
            .then((data) => {
                this.setState(Object.assign({}, this.state, {snippetModalVisible: true, widgetUrl: data.url}));
            });
    }

    closeSnippetModal() {
        this.setState(Object.assign({}, this.state, {snippetModalVisible: false}));
    }

    render() {
        var feedbackItems = this.state.feedbacks.docs.map(((f, idx)=>{
            var that = this, handler = (function(idx) {
                return (newFeedback) => that.handleFeedbackUpdate(newFeedback, idx);
            }(idx));

            if (idx === 0) {
                return <FeedbackItem data={f} key={f.feedbackKey} onUpdate={ handler } 
                    data-step = "2" data-intro="All the reviews that users enter from your email campaign will be shown here. You can publish or un-publish a review on your web page to start displaying it." showSnippetModal = { this.showSnippetModal.bind(this) }/>;
            }

            return <FeedbackItem data={f} key={f.feedbackKey} onUpdate={ handler } showSnippetModal = { this.showSnippetModal.bind(this) }/>;
        }).bind(this));

        const { total,page, limit,docs } = this.state.feedbacks;
        return (
            <Layout className="Feedback-extra-nomargin">
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

                <CodeSnippetModal widgetUrl={this.state.widgetUrl} visible = {this.state.snippetModalVisible} close={ this.closeSnippetModal.bind(this) }/>
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

class FeedbackItem extends Component {
    editedName = this.props.data.name
    state = { editReviewer: false }
    toggleEditBox() {
        this.setState(Object.assign({}, this.state, {editReviewer: !this.state.editReviewer}));
    }

    saveReviewerName() {
        if (!(/^[a-z][a-z0-9\s]*$/i).test(this.editedName)) {
            Modal.error({title: 'Invalid Reviewer Name', content: 'Name can only contain alphanumeric letters.'});
            return;
        }

        FeedbackApi.updateReviewerName(this.props.data.feedbackKey, this.editedName)
        .then(((resp) => {
            let feedback = this.props.data,
                fn, title;
            
            if (resp.success) {
                fn = notification.success;
                title = 'Success';
            } else {
                fn = notification.error;
                title: 'Error';
            }

            fn({
                message: title,
                description: resp.msg
            });

            feedback.name = this.editedName;
            this.toggleEditBox();
            this.props.onUpdate(feedback);
        }).bind(this));
    }

    render() {
        var feedback = this.props.data;
        var publishBtn,
            handlePublish = (function(isPublished) {
                let fn,
                    widgetCount = () => {
                        const meJson = document.getElementsByClassName('App')[0].getAttribute('data-me'),
                            me = JSON.parse(meJson);
                        return me.license.widgetCount;
                    };

                if (isPublished) { 
                    fn = FeedbackApi.unpublish;
                } else if (!widgetCount()) {
                    fn = (feedbackKey) => {
                        let resolve = () => { },
                        reject = () => { };

                        this.props.showSnippetModal();                    
                        return new Promise(resolve, reject);
                    }
                } else {
                    fn = FeedbackApi.publish;
                }

                fn(feedback.feedbackKey)
                .then((function(res) {
                    var title, fn;
                    if (res.success) { 
                        title = "Success";
                        fn = notification.success;
                        // update model
                        if (isPublished) feedback.isPublished = false;
                        else feedback.isPublished = true;
                        
                        this.props.onUpdate(feedback);
                    } else {
                        title = "Error";
                        fn = notification.error;
                    }

                    fn({
                        message: title,
                        description: res.msg
                    });
                }).bind(this));
        }).bind(this);

        let itemPublishedClass = "",
            displayedStyle = { display: 'none' },
            sampleStyle = { display: 'none'};
        if (feedback.isPublished) {
            publishBtn = (<Button className="fedoBtn faded" type="primary" size="small" onClick={ () => handlePublish(true) }>Stop showing on website</Button>);
            itemPublishedClass = "Feedback-Review-Published";
            displayedStyle = { display: 'inline', marginLeft: 15};
        } else {
            publishBtn = (<Button className="fedoBtn" type="primary" size="small" onClick={ () => handlePublish(false) }>Display on website</Button>);
        }

        if (feedback.sample) sampleStyle = { display: 'inline', marginLeft: 15};
        return (
            <List.Item {...this.props} style={{padding: 24, position: 'relative'}} className={ itemPublishedClass } 
                extra = 
                  {(<div style={{ textAlign: 'right' }} >
                        <div style={{position: 'absolute', bottom: 12, right: 24 }}>
                            <span> <i className='fa fa-envelope' /> &nbsp; { `Reviewed by: ${ feedback.emailId }` } </span>
                            <span style={{margin: '0 15px'}}> | </span>
                            <span >{ dateformat(feedback.updated, 'mmm d, yyyy') } </span>
                        </div> 
                    </div>
                  )}

                actions = { [<FeedbackItemMeta tags={feedback.tags} updateTimestamp={feedback.updated}/>] } 
                >

                <List.Item.Meta title={ 
                    <div>
                        <span className='Feedback-edit-wrap' style={{display: this.state.editReviewer? 'inline': 'none' }}>
                            <Input type='text' 
                                defaultValue = {feedback.name}
                                onChange = { ((e)=> { this.editedName = e.target.value }).bind(this) } 
                                suffix = { <Button style={{width: 24, height: 24, padding: 0}} type='primary' size='small'
                                    onClick = { this.saveReviewerName.bind(this) }><Icon type='check' /></Button>}
                                style = {{
                                    width: 294,
                                    height: 30,
                                    borderRadius: 4,
                                    color: 'rgb(136, 144, 151)',
                                    fontSize: '14px',
                                    lineHeight: '16px'
                                }}
                            />
                            <Icon type='close' 
                                style={{cursor: 'pointer', marginLeft: 20, color: '#aaa'}} 
                                onClick = { this.toggleEditBox.bind(this) }/>
                        </span>
                        <span style={{ display: this.state.editReviewer? 'none': 'inline'}}>
                            <span style={{textTransform: 'capitalize'}}>{ feedback.name }</span>
                            <i className="fa fa-pencil Feedback-name-edit" title="Click to edit reviewer's name"
                                onClick = { this.toggleEditBox.bind(this) }/>
                            <Rating rating={feedback.rating} />
                            <span style={sampleStyle} className={'Feedback-displayed'}>( SAMPLE REVIEW )</span>
                            <span style={ displayedStyle } className={'Feedback-displayed'}>( DISPLAYED )</span>
                        </span>
                        <span style={{float: 'right'}}>{ publishBtn }</span>
                    </div> 
                } />
                    <span className='Feedback-contentText'>{ feedback.feedbacktext }</span>
            </List.Item>      
        );
    }
}

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

var CodeSnippetModal = (props) => {
    let copyToClipBoard = (e) => {
        var elem = e.target;
        snippetCopy(elem);
    },

    snippetCopy = (elem) => {
        try {
            elem.select();
            document.execCommand('copy');
            message.info('Copied to clipboard');
        } catch (e) { /*ignore*/ }
    };

    return (
        <Modal
            title="Missing Code Snippet"
            visible={ props.visible }
            okText= { "Done" }
            width = { 700 }
            onOk = { props.close }
            onCancel = { props.close } >
            <div className='App-textMeta'> { "Looks like you have not pasted the widget code snippet on your website. Copy and paste this code below just before the </head> tag of your page. Make sure you paste the code on every page where you want the widget to be displayed" } </div>
            <code>
                <Input.TextArea key={(new Date()).getTime()} size='large' readOnly={true} style={{fontSize: 13, padding: '10px', resize: 'none', margin: '10px 0'}} rows={2} onClick={copyToClipBoard} id="snippetBoxPopup">
                {
                    "<script async type='text/javascript' src='" + props.widgetUrl +"'></script>"
                }
                </Input.TextArea>
                <Button type="primary" ghost onClick = { ()=> snippetCopy( document.getElementById('snippetBoxPopup') ) }>Copy</Button>
            </code>
        </Modal>
    );
}
export default FeedbacksView;

