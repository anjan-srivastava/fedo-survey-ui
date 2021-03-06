import React, { Component } from 'react';
import { Layout, Tabs, Affix } from 'antd';
import ProfileSettings from './ProfileSettings.js';
import EmailSettings from './EmailSettings.js';
import OtherSettings from './OtherSettings.js';

import './style.css';

const TabPane = Tabs.TabPane;

class SettingsView extends Component {
    render() {
        return (
            <Layout className={'WidgetSettings'}>
                <Layout.Content style={{background: '#fff'}}>
                    <Tabs tabBarStyle = {{margin: 0}}>
                        <TabPane tab="Profile" key="2"> <ProfileSettings /> </TabPane>
                        <TabPane tab="Email" key="3"> <EmailSettings /> </TabPane>
                        <TabPane tab="Other Stuff" key="4"> <OtherSettings /> </TabPane>
                    </Tabs>                    
                </Layout.Content>
            </Layout>
        ); 
    }
}


export default SettingsView;
            
