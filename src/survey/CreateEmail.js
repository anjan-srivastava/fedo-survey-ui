import React, { Component } from 'react';
import { InputNumber, Form, Switch, Button, Row, Col, Radio, Tag, Icon, Input, Modal, notification} from 'antd';
import Editor from 'react-medium-editor';
import Rating from '../rating';
import EditableTagGroup from '../editableTagGroup';
import SurveyApi from './SurveyApi.js';

import 'medium-editor/dist/css/medium-editor.css';
import 'medium-editor/dist/css/themes/default.css';

const CTYPE_INTEGRATION = 'INTEGRATION';

class Content extends Component {

    componentDidMount() {
        this.sendTestHook.addEventListener('SendTest', (evt) => {
            this.validateOnly(evt.detail.callback);    
        }, false);


        // explicitly call onChange handlers for
        // initial fields value
        const formInitialValue = this.props.form.getFieldsValue();
        let update = {};
        for(var prop in formInitialValue) {
            if (formInitialValue.hasOwnProperty(prop) &&
                    formInitialValue[prop]) {
               const value = formInitialValue[prop];
               switch(prop) {
                    case 'id_emailSubject': update['EmailSubject'] = value;
                                            break;
                    case 'id_emailCTA': update['CTA'] = value;
                                        break;
                    case 'id_emailBody': update['bodyPlaceHolder'] = '';
                                         update['bodyData'] = value;
                                         break;
                    case 'id_emailSign': update['signaturePlaceHolder'] = '';
                                         update['signatureData'] = value;
                                         break;
                   
               }
            }
        }
        
        setTimeout((function() {
        this.setState(Object.assign({}, this.state, update));
        }).bind(this),0);
    }

    isAutomatedSurvey() {
        return this.props.survey && this.props.survey.type &&
            this.props.survey.type.indexOf(CTYPE_INTEGRATION) != -1;
    }

    defaultSubject = "Help us improve with your feedback!";
    defaultMailBody = `<p>Hi there, </p>
                       <br />
                       <p>We hope you are enjoying your experience with us! It would be great if you can quickly share your feedback and rate us.</p>
                       <br />
                       <p>Any inputs you give will be useful ! :)</p>`;

    defaultValue = {
        CTA: "Send us your feedback",
        signaturePlaceholder: "Signature copy goes here",
        bodyPlaceholder: "Body copy goes here",
    };

    editorOptions = {
        toolbar: { buttons: ['bold', 'italic', 'underline', 'orderedlist', 'unorderedlist', 'anchor'] },
        placeholder: { hideOnClick: false }
    }
    state = this.defaultValue
    
    validateOnly(callback) {
       this.props.form.validateFieldsAndScroll((
                    (err, value) => {
                        callback(err, this.props.form.getFieldsValue());
                    }).bind(this)
                   ); 
    }

    
    handleFormSubmission(e) {
        e.preventDefault();
        let surveyKey = this.props.surveyKey;

        const saveOrEditApi = surveyKey ? SurveyApi.editSurvey: SurveyApi.sendSurvey;
    
        console.log("SurveyKey: ", surveyKey, this.props.router);

        this.props.form.validateFieldsAndScroll(((err, values) => {
            if (!err) {
                const formData = this.props.form.getFieldsValue();
                const saveOnly = document.getElementById('id_formCreateCampaignSubmit').getAttribute('data-saveonly');

                var apiCall = function() {
                    saveOrEditApi({
                        recepients: this.props.recepients,
                        title: formData.id_campaignName,
                        subject: formData.id_emailSubject,
                        tags: formData.id_campaignLabel,
                        mailBody: formData.id_emailBody,
                        cta: formData.id_emailCTA || 'Send us your feedback',
                        signature: formData.id_emailSign,
                        description: formData.id_campaignDesc,
                        saveOnly: saveOnly,
                        // present only in case of automated mails
                        config: {
                            mailActivation: formData.id_mailActivation,
                            mailAfterDays: formData.id_mailAfterDays
                        }

                    }, surveyKey)
                    .then((resp) => { if( resp.ok) return resp; throw { status: resp.status, msg: resp.text() }})
                    .then((resp) => { return resp.json(); })
                    .then(function(data) {
                        const saveOnly = document.getElementById('id_formCreateCampaignSubmit').getAttribute('data-saveonly');
                        const saveBtn = document.getElementById('id_formCreateCampaignSubmit');
                        if (saveOnly) {
                            !surveyKey && Modal.success({
                                title: 'Your campaign has been saved successfully',
                                content: 'Taking you to campaigns page.',
                                okText: "Ok",
                                onOk: function() { 
                                    window.location.href='#/surveys'; 
                                },
                            });
                            
                            surveyKey && Modal.confirm({
                                title: 'Your work has been saved',
                                content: 'Do you want to continue editing? ',
                                okText: "No, I'm done",
                                cancelText: "Yes",
                                onOk: function() { 
                                    window.location.href='#/surveys'; 
                                },
                                onCancel: function() {}
                            });

                        } else {
                            Modal.success({
                                title: 'Your emails have been sent',
                                content: 'Taking you to reviews page.',
                                okText: 'Ok',
                                onOk: function() { window.location.href='#/feedbacks'; },
                                onCancel: function() { window.location.href='#/feedbacks'; }
                            });
                        }
                    }).then(function() { 
                        document.getElementById('id_formCreateCampaignSubmit').removeAttribute('data-saveonly');
                    }).catch(function(err) {
                        err.msg.then((text) => {
                            if (err.status == 500) text = "Something went wrong, please try again.";
                            Modal.error({
                                title: 'Error while trying to send emails',
                                content: text,
                                okText: 'Ok',
                                onOk: function() { window.location.href= '#/feedbacks'; },
                                onCancel: function() { window.location.href='#/feedbacks'; }
                            });
                        });
                    });

                }.bind(this); // apiCall declaration ends here

                if (!saveOnly) {
                    Modal.confirm({
                        title: 'Are you sure to send this campaign?',
                        content: 'This operation would send mails to end users.',
                        okText: 'Yes, Sure',
                        cancelText: 'No, wait',
                        onOk: function () { apiCall(); },
                        onCancel: function () { }
                    });
                } else {
                    apiCall();
                }
            }
        }).bind(this));
    }
  
    handlePreviewMode(event) {
        if (event.target.value == "mobile") {
            this.setState(Object.assign({}, this.state, { previewModeWidth:  '400px'}));
        } else { 
            this.setState(Object.assign({}, this.state, { previewModeWidth:  'auto'}));
        }
    }
    
    render() {
        const { getFieldDecorator } = this.props.form;
        let { title, tags, subject, mailBody, cta, signature, description, config } = this.props.survey;
        config = config || {};

        subject = subject ? subject: this.defaultSubject;
        mailBody = mailBody ? mailBody: this.defaultMailBody;

        const automatedMailConfig = this.isAutomatedSurvey()?(
            <div>
                <Row className="CreateCampaign-Section smallpad">
                    <Form.Item >
                        <h3 style={{display: 'inline-block'}} id="id_mailActivation">Mail after Purchase </h3>
                        <span 
                            className="App-textMeta"
                            style={{margin: '0 10px'}}>
                                { this.props.form.getFieldValue('id_mailActivation')?'(ACTIVE)': '(DEACTIVE)' }
                        </span>
                        { getFieldDecorator('id_mailActivation', { initialValue: config.mailActivation, valuePropName: 'checked' })
                            (
                                <Switch style={{float: 'right'}}/>
                            ) 
                        }
                        <div className = "App-textMeta">Activate to begin sending mail after purchase emails.</div>
                    </Form.Item>
                </Row>

                <Row className="CreateCampaign-Section ">
                    <Form.Item >
                        <h3 style={{display: 'inline-block'}} id="id_mailAfterDays">Send mail after </h3>
                        { getFieldDecorator('id_mailAfterDays', {initialValue: config.mailAfterDays, 
                                rules:[ { validator: ((r, v, c)=>{
                                    if (this.props.form.getFieldValue('id_mailActivation') && !v) {
                                        c('This field is mandatory');
                                    }
                                    c();
                                }).bind(this)}] })
                            (
                                <InputNumber min={1} max={15} 
                                    style={{margin: '0 25px'}}/>  
                            ) 
                        }
                        <h3 style={{display: 'inline-block'}} id="id_mailActivationRest">days of purchase </h3>
                    </Form.Item>
                </Row>
            </div>
        ):(null);

        return (
            <Row type="flex">
                <Col span={12}>
                    <Form id="id_formCreateCampaign" onSubmit = { this.handleFormSubmission.bind(this) } >
                        { automatedMailConfig }

                        <Row className="CreateCampaign-Section">
                            <Form.Item>
                                <h3 id="id_campaignName">Name of this email campaign*</h3>
                                { getFieldDecorator('id_campaignName', { initialValue: title,
                                                                           rules: [{required: true, message: 'Campaign name is required'}]})(
                                        <Input className="noborder" placeholder="eg: Automaitc coffee maker" />
                                        ) }
                            </Form.Item>
                        </Row>
                        <Row className="CreateCampaign-Section">
                            <Form.Item>
                                <h3 id="id_campaignDesc">Description of this email campaign</h3>
                                { getFieldDecorator('id_campaignDesc', { initialValue: description })(
                                        <Input className="noborder" placeholder="Describe this campaign a bit" />
                                        ) }
                            </Form.Item>
                        </Row>

                        <Row className="CreateCampaign-Section">
                            <Form.Item>
                                <h3 id="id_campaignLabel">Add a Label</h3>
                                { getFieldDecorator('id_campaignLabel')(<EditableTagGroup addBtn = { true } initialValue = { tags }/>) }
                            </Form.Item>
                        </Row>
                        <Row className="CreateCampaign-Section">
                            <Form.Item>
                                <h3 id="id_emailSubject">Email Subject*</h3>
                                { getFieldDecorator('id_emailSubject', { initialValue: subject, rules: [{required: true, message: 'Email subject is required'}]})(
                                    <Input className="noborder" placeholder="eg: When I enter my office I would like to have a cup of coffee immediately." 
                                        onChange = { this.handleFieldChange('EmailSubject').bind(this) } 
                                    />
                                  ) }
                            </Form.Item>
                        </Row>
                        <Row className="CreateCampaign-Section">
                            <Form.Item>
                                <h3 id="id_emailBody">Body</h3>

                                { getFieldDecorator('id_emailBody', { initialValue: mailBody, valuePropName: 'text' })(
                                <Editor style={{minHeight: 125}} options={ this.editorOptions }
                                    onChange = { this.handleBodyChange.bind(this) } className="noborder CreateCampaign-mediumEditor" data-placeholder="eg: orem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo" /> ) }
                            </Form.Item>
                        </Row>
                        <Row className="CreateCampaign-Section">
                            <Form.Item>
                                <h3 id="id_emailCTA">CTA</h3>
                                { getFieldDecorator('id_emailCTA', {initialValue: cta})( 
                                        <Input className="noborder" placeholder="eg: Send us your feedback" onChange = { this.handleFieldChange('CTA').bind(this) } /> 
                                        ) }
                            </Form.Item>
                        </Row>
                        <Row className="CreateCampaign-Section">
                            <Form.Item onChange = { this.handleSignatureChange.bind(this) }>
                                <h3 id="id_emailSign">Signature</h3>

                                { getFieldDecorator('id_emailSign', {initialValue: signature, valuePropName: 'text'})(
                                <Editor  style={{ minHeight: 63 }} options={ this.editorOptions } className="noborder CreateCampaign-mediumEditor" 
                                    onChange={ this.handleSignatureChange.bind(this) } 
                                    data-placeholder="eg: Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus." /> ) }
                            </Form.Item>
                        </Row>
                        <Form.Item><Button id="id_formCreateCampaignSubmit" htmlType="submit" style={{width:0,height:0,position:'absolute',top:-9999,left:-9999}}></Button></Form.Item>
                </Form>
                    <i id="id_sendTestForm" ref={ el => this.sendTestHook = el } style={{position:'absolute',width:0,height:0,top:-9999,left:-9999}}></i>
                </Col>

                <Col span={12} className="App-checkedBackground" style={{ padding: 16 }}>
                    <Row type="flex" justify="end" gutter = { 0 } style={{ margin: '18px 0' }}>
                        <Col span={8} style = {{textAlign: 'center'}}>
                            <Radio.Group defaultValue="desktop" onChange = { this.handlePreviewMode.bind(this) }>
                                <Radio.Button value="desktop">Desktop</Radio.Button>
                                <Radio.Button value="mobile">Mobile</Radio.Button>
                            </Radio.Group>
                        </Col>
                        <Col span={8}>
                        {/* <Button style={{color: '#aaa', fontSize: 12}} className="pull-right">Copy HTML</Button> */}
                        </Col>
                    </Row>

                    <Row type="flex" justify="center" style={{width: this.state.previewModeWidth, margin: 'auto'}}>
                        <Col span={24} className="CreateCampaign-mailPreview">
                            <Row className="section" style={{borderBottom: 'solid 1px #e3e5e6'}}>
                                <Input id="EmailSubject_preview" placeholder = "Email subject goes here" value = { this.state.EmailSubject } 
                                    className="noborder mediumFont" readOnly = { true } />
                            </Row>
                            <Row className="section">
                                <div style={{marginBottom: 40}}>
                                <Editor style={{minHeight: 85 }} 
                                    text = { this.state.bodyData } 
                                    data-disable-editing="true" 
                                    className="noborder CreateCampaign-mediumEditor" 
                                    data-placeholder= { this.state.bodyPlaceholder } 
                                    key = { (new Date()).getTime() }/>
                                </div>
                                <Rating btnText = { this.state.CTA } />
                            </Row>
                            <Row className = "section signature" style = {{background: 'rgb(250,250,250)'}}>
                                 <Editor  style={{ minHeight: 63 }} text={ this.state.signatureData } className="noborder CreateCampaign-mediumEditor" 
                                    data-placeholder={ this.state.signaturePlaceholder } data-disable-editing = "true" 
                                    key = { (new Date()).getTime() }/>
                            </Row>
                        </Col>
                    </Row>
                </Col>
            </Row>        
        );
    }


    handleFieldChange(fieldKey) {
        return (event) => {
            var value = event.target.value,
                update = { };
        
            if (! value ) { 
                if (this.defaultValue[fieldKey]) {
                    value = this.defaultValue[fieldKey];
                }
                setTimeout(function() { try { document.getElementById(fieldKey + "_preview").focus(); } catch(e) { } },
                        10);
            }
            
            update[fieldKey] = value;
            this.setState(Object.assign({}, this.state, update));
            console.log("Handle Field Chnage", event, update);
        };
    }

    handleSignatureChange(text, medium) {
        var update = { signatureData: text, signaturePlaceholder: " " };
        if (/^<p>(\s*|<br\s*\/?>)<\/p>$/.test(text)) {
            update['signaturePlaceholder'] = this.defaultValue.signaturePlaceholder;
        }
        this.setState(Object.assign({}, this.state, update));
    }
    
    handleBodyChange(text, medium) {
        var update = { bodyData: text, bodyPlaceholder: " " };
        if (/^<p>(\s*|<br\s*\/?>)<\/p>$/.test(text)) {
            update['bodyPlaceholder'] = this.defaultValue.bodyPlaceholder;
        }

        this.setState(Object.assign({}, this.state, update ));
    }


    
};

class Footer extends Component {
    state = { sendTestModalVisible: false }
    showModal() { this.setState( { sendTestModalVisible: true } ); }
    closeModal() { this.setState( { sendTestModalVisible: false } ); }

    handleOk(e) { this.handleSubmit() }
    handleCancel(e) { console.log(e); this.closeModal(); }

    sendSurvey() {
        document.getElementById('id_formCreateCampaignSubmit').click();
    }

    saveSurvey() {
        const campaignFormSubmitButton = document.getElementById('id_formCreateCampaignSubmit');
        const requestInProg = campaignFormSubmitButton.hasAttribute('data-saveonly');
        //if (requestInProg) return; // save request already in process

        campaignFormSubmitButton.setAttribute('data-saveonly', 'true');
        campaignFormSubmitButton.click(); 
    }

    isAutomatedSurvey() {
        return this.props.survey && this.props.survey.type &&
            this.props.survey.type.indexOf(CTYPE_INTEGRATION) != -1;
    }

    sendTest() {
        const event = new CustomEvent('SendTest', {detail: {callback: (function(err, value) {
            if(!err) { 
                this.formData = value;
                this.showModal();
            }
        }).bind(this)}});
        document.getElementById('id_sendTestForm').dispatchEvent(event);
    }

   notify(type, title, desc) {
        notification[type]({
            message: title,
            description: desc
        });
    }

    handleSubmit(e) {
        e && e.preventDefault();
        this.props.form.validateFields(((err, value)=>{ 
            if (!err) {
                const formData = this.formData;
                SurveyApi.sendSurvey({
                    testRun: true,
                    recepients: [ this.props.form.getFieldsValue()['id_testEmailId'] ],
                    title: formData.id_campaignName,
                    subject: formData.id_emailSubject,
                    tags: formData.id_campaignLabel,
                    mailBody: formData.id_emailBody,
                    cta: formData.id_emailCTA || 'Send us your feedback',
                    signature: formData.id_emailSign,
                    description: formData.id_campaignDesc                
                })
                .then((resp) => {
                    if (resp.ok) return resp; console.log(resp); throw { status: resp.status, msg: resp.text() };
                })
                .then((resp) => resp.json())
                .then(((data) => this.notify('success', 'Send Test', 'Last operation was successful. Make sure you have used correct email id.')).bind(this))
                .catch(((err) =>  { 
                    const that = this; 
                    err.msg.then((text) =>  { 
                        if (err.status == 500) text='Something went wrong, please try again.';
                        that.notify('error', 'Send Test', text) 
                        }) 
                }).bind(this));


                this.closeModal();

            }
        }).bind(this));
    }


    render() {
        const { getFieldDecorator } = this.props.form;
        return (<div style={{width: '89%'}}>
                    <Button type="primary" style={{width: 100, marginRight: 20, display: this.isAutomatedSurvey()?'none':'inline'}} onClick={ this.sendSurvey }>Send Now</Button>
                    <Button  style={{width: 100, fontSize: '11px', color: '#aaa'}} onClick={ this.sendTest.bind(this) } >Send Test</Button>
                    <Button type="primary" style={{width: 100, marginRight: 20}} className={this.isAutomatedSurvey()?"pull-left": "pull-right"} onClick={ this.saveSurvey.bind(this) }>Save</Button>
                    <Modal title="Send Test"
                        okText="Send"
                        visible={ this.state.sendTestModalVisible }
                        onOk={ this.handleOk.bind(this) }
                        onCancel={ this.handleCancel.bind(this) }>
                        <Form onSubmit={ this.handleSubmit.bind(this) }>
                            <Form.Item>
                                <h4 id="id_testEmailId">Test email id</h4>
                                { getFieldDecorator('id_testEmailId', { rules: [{type: 'email', message: 'Invalid email id'}] })(<Input type="email" />) }
                            </Form.Item>    
                        </Form>
                    </Modal>
                </div>);
    }
};

var CreateEmail = {
    Content: Form.create({})(Content),
    Footer: Form.create({})(Footer)
};

export default CreateEmail;
