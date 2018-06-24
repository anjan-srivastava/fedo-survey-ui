import React, { Component } from 'react';
import { Layout, Form, Row, Col, Button, Input, Icon } from 'antd';

import './style.css';

class Shopify extends Component {

	initIntegration() {
		const shopregex = /^[^.]+\.myshopify\.com$/i,
			shop = document.getElementById('shopdomain').value;

		if (shopregex.test(shop)) {
			let popup =
				window.open(`http://localhost:3000/integrations/shopify/install?shop=${shop}`,
					'Authorize OutReech', 'height=600,width=900');
			if (popup) popup.focus();				
		}
	}

	render() {
		return (
			<Layout style = {{background: '#fff'}}>
				<Layout.Content>
					<Row style={{borderBottom: 'solid 1px #e3e5e6', padding: '18px 30px'}}>
                		<Col span={24}>
                    		<span style={{
                    				fontSize: 14,
                    				fontWeight: 500,
                    				lineHeight: '24px'
                    			}}>
                    			Integrations - Shopify
                    			</span>
                		</Col>
            		</Row>

            		<Layout>
            			<Layout.Content style={{ padding: 30, background:'#fff' }}>
            				<section className="shopDomainSection">
            					<Row style={{boxShadow: 'inset 0 -1px 0 0 #EAECED'}}>
            						<Col span = {2} 
            							style={{
            								padding: 15, 
            								boxShadow: 'inset -1px -1px 0 0 #EAECED',
            								textAlign: 'center'
            							}}
            						>
            							<Icon type="shop" style={{fontSize: 30}}/>
            						</Col>
            						<Col span = {22} style={{padding: 15 }} ></Col>
            					</Row>
            					<Row>
            						<Col span = {24} style={{padding: 22 }}>
            							<Form>
            								<Form.Item label = "Enter your Shopify domain name">
            									<Input
            										addonBefore={<Icon type="check" />}
       												id="shopdomain"
            									/>

            									<p className="App-textMeta" style={{margin: '10px 0'}}>
            										eg: thewhitecat.myshopify.com
            									</p>

            									<p>
            										<Button type="primary" className="fedoBtn"
            											onClick = { this.initIntegration.bind(this) }
            											style={{
            												padding: '0 34px',
            												marginTop: 20
            											}}>Save</Button>
            									</p>
            								</Form.Item>
            							</Form>
            						</Col>
            					</Row>
            				</section>

            				<section className="instructionSection">
            					<Row>
            						<Col span = {24}>
            							Step 1 - Adding the OutReech app to your Shopify account 
            						</Col>
            					</Row>
            					<Row>
            						<Col span = {24}>
            							<ol>
            								<li>Access your Shopify admin</li>
            								<li>Click on Apps</li>
            								<li>Click Visit Shopify App Store</li>
            								<li>Search and chose OutReech</li>
            								<li>Click Get</li>
            								<li>Click Install app</li>
            								<li>Create a password for your OutReech account</li>
            							</ol>
            						</Col>
            					</Row>
            				</section>


            				<section className="instructionSection">
            					<Row>
            						<Col span = {24}>
            							Step 2 - Add OutReech's JavaScript (*Required)
            						</Col>
            					</Row>
            					<Row>
            						<Col span = {24}>
            							<ol>
            								<li>Open your Shopify admin</li>
            								<li>Click on Online store</li>
            								<li>Click on Themes </li>
            								<li>Click on Actions</li>
            								<li>Click on Edit Code: </li>
            								<li>Access the file theme.liquid which appears under Layout (you can also use the search on the left to find the files):</li>
            								<li>{ 'Copy and paste the following code right under above the </head> section:' } </li>
            								<li>Click the Save button at the top right corner of the screen. </li>
            							</ol>
            						</Col>
            					</Row>
            				</section>
            			</Layout.Content>
            		</Layout>
				</Layout.Content>
			</Layout>
		);
	}
}

export default Shopify;