import React, { Component } from 'react';
import { Form, Button, Row, Col, Radio, Tag, Icon, Input, Modal, notification} from 'antd';
import Editor from 'react-medium-editor';
import Rating from '../rating';
import EditableTagGroup from '../editableTagGroup';
import SurveyApi from './SurveyApi.js';

import 'medium-editor/dist/css/medium-editor.css';
import 'medium-editor/dist/css/themes/default.css';

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

               setTimeout((function() {
                this.setState(Object.assign({}, this.state, update));
               }).bind(this),0);
            }
        }
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
        const surveyKey = this.props.surveyKey;
        const saveOrEditApi = surveyKey ? SurveyApi.editSurvey: SurveyApi.sendSurvey;
    
        console.log("SurveyKey: ", surveyKey);

        this.props.form.validateFieldsAndScroll(((err, values) => {
            if (!err) {
                const formData = this.props.form.getFieldsValue();
                saveOrEditApi({
                    recepients: this.props.recepients,
                    title: formData.id_campaignName,
                    subject: formData.id_emailSubject,
                    tags: formData.id_campaignLabel,
                    mailBody: formData.id_emailBody,
                    cta: formData.id_emailCTA || 'Send us your feedback',
                    signature: formData.id_emailSign,
                    saveOnly: document.getElementById('id_formCreateCampaignSubmit').getAttribute('data-saveonly')
                }, surveyKey)
                .then((resp) => { if( resp.ok) return resp; throw new Error(resp.statusText)})
                .then((resp) => { return resp.json(); })
                .then(function(data) {
                    const saveOnly = document.getElementById('id_formCreateCampaignSubmit').getAttribute('data-saveonly');
                    if (saveOnly) {
                        if (window.confirm("Saved Successfully. Do you want to continue editing?")) {
                            // do nothing stay on email template page
                        } else {
                            window.location.href='/';
                        }
                    } else {
                        alert("Sent successfully, redirecting you to campaign list.");
                        window.location.href='/';
                    }
                }).then(function() { 
                    document.getElementById('id_formCreateCampaignSubmit').removeAttribute('data-saveonly');
                }).catch(function(err) {
                    alert("Something went wrong, please retry. Redirecting you to campaign list.");
                    window.location.href='/';
                })
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
        let { title, tags, subject, mailBody, cta, signature } = this.props.survey;
        subject = subject ? subject: this.defaultSubject;
        mailBody = mailBody ? mailBody: this.defaultMailBody;
        return (
            <Row type="flex">
                <Col span={12}>
                    <Form id="id_formCreateCampaign" onSubmit = { this.handleFormSubmission.bind(this) } >
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
                            <Button style={{color: '#aaa', fontSize: 12}} className="pull-right">Copy HTML</Button>
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
        campaignFormSubmitButton.setAttribute('data-saveonly', 'true');
        campaignFormSubmitButton.click(); 
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
                    signature: formData.id_emailSign                
                })
                .then((resp) => {
                    if (resp.ok) return resp; throw new Error(resp.statusText);
                })
                .then((resp) => resp.json())
                .then(((data) => this.notify('success', 'Send Test', 'Last operation was successful. Make sure you have used correct email id.')).bind(this))
                .catch(((err) => this.notify('error', 'Send Test', 'Something went wrong while sending mail. Please try again.')).bind(this));


                this.closeModal();

            }
        }).bind(this));
    }

    render() {
        const { getFieldDecorator } = this.props.form;
        return (<div style={{width: '89%'}}>
                    <Button type="primary" style={{width: 100, marginRight: 20}} onClick={ this.sendSurvey }>Send Now</Button>
                    <Button  style={{width: 100, fontSize: '11px', color: '#aaa'}} onClick={ this.sendTest.bind(this) } >Send Test</Button>
                    <Button type="primary" style={{width: 100, margin: '0 20px'}} className="pull-right" onClick={ this.saveSurvey.bind(this) }>Save</Button>
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
