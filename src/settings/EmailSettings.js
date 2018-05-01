import React, { Component } from 'react';
import { Layout, Form, Input, Button, Tooltip, Icon, notification } from 'antd';

import SettingsApi from './SettingsApi';

const formItemLayout = {
        labelCol: { span: 6 },
            wrapperCol: { span: 14 },
};

class EmailSettings extends Component {

    submitForm() {
        document.getElementById('emailSettingSubmitBtn').click();
    }

    render() {
        return (
            <Layout>
                <Layout.Content style={{background: '#fff'}}>
                    <div style={{padding: '0 30px'}}>
                        <section>
                            <DecoratedEmailSettingsForm />
                        </section>
                    </div>
                </Layout.Content>

                <Layout.Footer className={'CreateCampaign-Footer'} style={{position:'relative'}}>
                    <div style={{width: '89%'}}>
                        <Button className={'fedoBtn'} type='primary' style={{width: 100}} onClick= { this.submitForm }>Save</Button>
                    </div>
                </Layout.Footer>
            </Layout>        
        );
    }
}

class EmailSettingsForm extends Component {
    state = {
        emailSettings: {
            fromField: '',
            replyTo: ''
        }
    }

    componentDidMount() {
        SettingsApi.getEmailSettings()
            .then(((data) => {
                this.setState(Object.assign({}, this.state: {emailSettings: data}));
                this.props.form.setFieldsValue({
                    emailSettings_fromField: data.fromField,               
                    emailSettings_replyToField: data.replyTo               
                });
            }).bind(this));
    }

    handleSubmission(e) {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll(function(err, values) {
            if (!err) {
                SettingsApi.saveEmailSettings({
                    fromName: values.emailSettings_fromField,
                    replyTo: values.emailSettings_replyToField
                }).then(function(res) {
                    var fn, title;
                    if (res.success) {
                        fn = notification.success;
                        title= 'Success';
                    } else {
                        fn = notification.error;
                        title = 'Error';
                    }

                    fn({message: title, description: res.msg});
                });
            } 
        
        });
    }

    render() {
        const { getFieldDecorator } = this.props.form;
        return (
            <Form className="Email-emailSettingsForm" onSubmit = { this.handleSubmission.bind(this) }>
                <Form.Item { ...formItemLayout } label={(
                            <span>From <Tooltip title='The text that you enter here will be used in your email "From" field.'><Icon type="question-circle-o" style={{fontWeight: 100, fontSize: 11}}/></Tooltip></span>
                        )} id="emailSettings_fromField">
                    {   
                        getFieldDecorator('emailSettings_fromField', {initialValue: this.state.emailSettings.fromField,
                            rules: [{required: true, message: 'From field can not be empty.'}, {max: 100, message: 'Maximum 100 characters allowed.'}]})(
                            <Input />
                        )
                    }
                </Form.Item>
                <Form.Item { ...formItemLayout } label={(
                            <span>Reply To <Tooltip title='If users reply to your email campaign, it will be sent to this email.'><Icon type="question-circle-o" style={{fontWeight: 100, fontSize: 11}}/></Tooltip></span>
                        )} id="emailSettings_replyToField">
                    {   
                        getFieldDecorator('emailSettings_replyToField', {initialValue: this.state.emailSettings.replyTo,
                            rules: [{required: true, message: '"Reply To" field can not be empty.'}, {type: 'email', message: "The email doesn't look right. Please try again."}]})(
                            <Input />
                        )
                    }
                </Form.Item>

                <Form.Item style={{display: 'none'}}>
                    <Button htmlType='submit' id='emailSettingSubmitBtn'></Button>
                </Form.Item>
            </Form>
        ); 
    }
}

var DecoratedEmailSettingsForm = Form.create({})(EmailSettingsForm);

export default EmailSettings;
