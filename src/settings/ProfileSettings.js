import React, { Component } from 'react';
import { Layout, Form, Input, Button, notification } from 'antd';

import SettingsApi from './SettingsApi';

class ProfileSettings extends Component {

    submitForm() {
        document.getElementById('profileSubmitBtn').click();
    }

    render() {
        return (
            <Layout>
                <Layout.Content style={{background: '#fff'}}>
                    <div style={{padding: '0 30px'}}>
                        <section>
                            <DecoratedProfileForm />
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

class ProfileForm extends Component {
    state = {
        profile: {
            name: '',
            lname: '',
            username: '',
            contactNumber: '',
            company: '',
            address: ''
        }
    }

    componentDidMount() {
        SettingsApi.getProfileSettings()
            .then(function(data) {
                this.setState(Object.assign({}, this.state, data));
                this.props.form.setFieldsValue({
                    profile_firstName: data.name,
                    profile_lastName: data.lname,
                    profile_email: data.username,
                    profile_contactNumber: data.contactNumber,
                    profile_company: data.company,
                    profile_address: data.address
                }); 
            }.bind(this));
    }

    handleSubmission(e) {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll(function(err, values) {
            if (!err) {
                SettingsApi.saveProfileSettings({
                    name: values.profile_firstName,
                    lname: values.profile_lastName,
                    username: values.profile_email,
                    contactNumber: values.profile_contactNumber,
                    company: values.profile_company,
                    address: values.profile_address 
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
            <Form className="Profile-profileForm" onSubmit = { this.handleSubmission.bind(this) }>
                <Form.Item label="First name" id="profile_firstName">
                    {   
                        getFieldDecorator('profile_firstName', {initialValue: this.state.profile.name,
                            rules: [{required: true, message: 'First name can not be empty.'}]})(
                            <Input />
                        )
                    }
                </Form.Item>
                <Form.Item label="Last name" id="profile_lastName">
                    {   
                        getFieldDecorator('profile_lastName', {initialValue: this.state.profile.lname})(
                            <Input />
                        )
                    }
                </Form.Item>
                <Form.Item label="Email" id="profile_email">
                    {   
                        getFieldDecorator('profile_email', {initialValue: this.state.profile.username,
                            rules: [{required: true, message: 'Email can not be empty'}, {type: 'email', message: 'Invalid email.'}]})(
                            <Input />
                        )
                    }
                </Form.Item>
                <Form.Item label="Contact number" id="profile_contactNumber">
                    {   
                        getFieldDecorator('profile_contactNumber', {initialValue: this.state.profile.contactNumber,
                            rules: [{pattern: /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/, message: 'Invalid contact number'}]})(
                            <Input />
                        )
                    }
                </Form.Item>
                <Form.Item label="Company" id="profile_company">
                    {   
                        getFieldDecorator('profile_company', {initialValue: this.state.profile.company,
                            rules: [{required: true, message: 'Company name can not be empty.'}]})(
                            <Input />
                        )
                    }
                </Form.Item>
                <Form.Item label="Address" id="profile_address">
                    {   
                        getFieldDecorator('profile_address', {initialValue: this.state.profile.address,
                            rules: [{max: 140, message: 'Address can not be more than 140 characters.'}]})(
                            <Input.TextArea rows={ 5 } style={{resize: 'none', padding: '8px 10px'}}/>
                        )
                    }
                </Form.Item>

                <Form.Item>
                    <Button htmlType='submit' style={{display: 'none'}} id='profileSubmitBtn'></Button>
                </Form.Item>
            </Form>
        ); 
    }
}

var DecoratedProfileForm = Form.create({})(ProfileForm);

export default ProfileSettings;
