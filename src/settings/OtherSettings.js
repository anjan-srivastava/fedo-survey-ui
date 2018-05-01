import React, { Component } from 'react';
import { Layout, Form, Input, Button, Tooltip, Icon, notification } from 'antd';

import SettingsApi from './SettingsApi';

import myintro from '../myintro.js';

const formItemLayout = {
        labelCol: { span: 6 },
            wrapperCol: { span: 14 },
};

class OtherSettings extends Component {
    showIntro() {
        myintro.firstLogin = true;
        myintro.ismanual = true;
        document.getElementsByClassName('ant-tabs-tab')[0].click();
        setTimeout(function() { myintro("/feedbacks"); }, 800);
        window.mixpanel.track('Initiate Onboarding', {'Trigger Type': myintro.ismanual?"Manual": "Automatic"});
    }

    render() {
        return (
            <Layout>
                <Layout.Content style={{background: '#fff'}}>
                    <div style={{padding: '0 30px'}}>
                        <section>
                            <h3>Feature Intro</h3>
                            <Button className={'fedoBtn'} type='primary'  onClick = {this.showIntro} >Show me the feature introduction</Button>
                        </section>
                    </div>
                </Layout.Content>
            </Layout>        
        );
    }
}

export default OtherSettings;
