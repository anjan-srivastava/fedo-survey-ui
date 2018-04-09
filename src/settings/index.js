import React, { Component } from 'react';
import { Layout, Tabs } from 'antd';
import WidgetSettings from './WidgetSettings.js';
import ProfileSettings from './ProfileSettings.js';

import './style.css';

const TabPane = Tabs.TabPane;

class SettingsView extends Component {
    
    render() {
        return (
            <Layout className={'WidgetSettings'}>
                <Layout.Content style={{background: '#fff'}}>
                    <Tabs>
                        <TabPane tab="Widget" key="0"> <WidgetSettings /> </TabPane>
                        <TabPane tab="Profile" key="1"> <ProfileSettings /> </TabPane>
                        <TabPane tab="Billing" key="2"> </TabPane>
                    </Tabs>                    
                </Layout.Content>
            </Layout>
        ); 
    }
}


export default SettingsView;
