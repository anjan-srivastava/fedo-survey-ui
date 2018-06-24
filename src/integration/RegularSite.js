import React, { Component } from 'react';
import { Layout, Tabs, Affix } from 'antd';
import WidgetSettings from './WidgetSettings.js';
import CarouselSettings from './CarouselSettings.js';

import '../settings/style.css';

const TabPane = Tabs.TabPane;

class RegularSite extends Component {
    render() {
        return (
            <Layout className={'WidgetSettings'}>
                <Layout.Content style={{background: '#fff'}}>
                    <Tabs tabBarStyle = {{margin: 0}}>
                        <TabPane tab="Widget" key="0" id="widgetSettingsTab"> <WidgetSettings /> </TabPane>
                        <TabPane tab="Carousel" key="1" id="carouselSettingsTab"> <CarouselSettings /> </TabPane>
                    </Tabs>                    
                </Layout.Content>
            </Layout>
        ); 
    }
}


export default RegularSite;
            
