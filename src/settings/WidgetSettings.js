import React, { Component } from 'react';
import { Layout, Form, Button, Switch, Radio, InputNumber, Input, notification, message } from 'antd';
import SettingsApi from './SettingsApi.js';

const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 14 },
};

class WidgetSettings extends Component {
    state = { widgetLink: "",
        config: {
            licenseReviewLimit: 10,
            settings: {
                enabled: true,
                position: 0, // left 
                scrollEnabled: false,
                titleEnabled: true,
                titleText: 'What people say about our product!',
                showReviewerName: true,
                defaultState: 0, // minimized
                showReviewDate: true,
                maxReviews: 3
            },
            design: {
                backgroundColorOpen: '#ffffff',
                titleFontColor: '#495864',
                nameFontColor: '#000000',
                fontColor: '#333333',
                ratingIconColor: '#abcdef',
                outreechFavColor: '#ff0000'
            }
        }
    };

    componentDidMount() {
        SettingsApi.getWidgetLink()
        .then(function(data) {
            this.setState(Object.assign({}, this.state, { widgetLink: data.url }));
            
            SettingsApi.getWidgetConfig()
            .then(function (config) {
                this.setState(Object.assign({}, this.state, {config: config}));
                console.log('inner', this.state);
            }.bind(this));  
        }.bind(this));

              
    }

    restoreDefaults(e) {
        SettingsApi.restoreWidgetDefaults()
            .then(function (res) {
                var fn, title;
                if (res.success) {
                    title = 'Success';
                    fn = notification.success;
                    this.setState(Object.assign({}, this.state, {config: res.widgetConfig}));
                } else {
                    title = 'Error';
                    fn = notification.error;
                }

                fn({message: title, description: res.msg});
            }.bind(this));
    }

    saveSettings(e) {
        document.getElementById('designSettingsForm').click();    
    }

    getConfigHandlerFor(key) {
        return ((newValue)=> {
            if (newValue.target) newValue = newValue.target.value;
            let parts = key.split('.'),
                current = this.state.config;

            for (var i=0; i < parts.length-1; i+=1) current = current[parts[i]];
            current[parts[i]] = newValue;

            this.setState(Object.assign({}, this.state));
        }).bind(this);
    }

    copyToClipBoard(e) {
        try {
            var elem = e.target;
            elem.select();
            document.execCommand('copy');
            message.info('Copied to clipboard');
        } catch (e) { /*ignore*/ }
    }

    render() {
        return (
         <Layout>
             <Layout.Content style={{ backgroundColor: '#fff'}}>
                 <div style={{ padding: '0 30px' }}>
                    <section>
                        <h3>
                            <span>Embed Code</span>
                        </h3>
                         <div className='App-textMeta'>Copy and paste this code below to any page of your website where you want the widget to be shown</div>
                        <code>
                        <Input.TextArea key={(new Date()).getTime()} size='large' readOnly={true} style={{fontSize: 13, padding: '10px', resize: 'none'}} rows={1} onClick={this.copyToClipBoard}>
                        { 
                            "<script async type='text/javascript' src='" + this.state.widgetLink +"'></script>"
                        }
                        </Input.TextArea>
                        </code>
                    </section>

                    <section className={'Settings'}>
                        <h3>Settings</h3>
                        <Form>
                            <Form.Item {...formItemLayout} label="Display widget on website" >
                                <FedoSwitch isOn = { this.state.config.settings.enabled } onChange = { this.getConfigHandlerFor('settings.enabled') }/>
                            </Form.Item>
                            <Form.Item {...formItemLayout} label="Display widget to the" >
                                <Radio.Group value={this.state.config.settings.position}
                                    onChange = { this.getConfigHandlerFor('settings.position') }>
                                    <Radio value={1}>Right</Radio><Radio value={0}>Left</Radio>
                                </Radio.Group>
                            </Form.Item>
                            <Form.Item {...formItemLayout} label="Automatically scroll reviews" >
                                <FedoSwitch isOn = { this.state.config.settings.scrollEnabled } onChange = { this.getConfigHandlerFor('settings.scrollEnabled') }/>
                            </Form.Item>
                            <Form.Item {...formItemLayout} label="Display widget title" >
                                <FedoSwitch isOn = { this.state.config.settings.titleEnabled } onChange = { this.getConfigHandlerFor('settings.titleEnabled') }/>
                            </Form.Item>
                            <Form.Item {...formItemLayout} label="Widget title text" >
                                <Input style={{width: 300}} value = { this.state.config.settings.titleText } onChange = { this.getConfigHandlerFor('settings.titleText') }/>
                            </Form.Item>
                            <Form.Item {...formItemLayout} label="Display reviewer name" >
                                <FedoSwitch isOn = { this.state.config.settings.showReviewerName } onChange = { this.getConfigHandlerFor('settings.showReviewerName') }/>
                            </Form.Item>
                            <Form.Item {...formItemLayout} label="Default state" >
                                <Radio.Group value={this.state.config.settings.defaultState}
                                    onChange = {this.getConfigHandlerFor('settings.defaultState') } >
                                    <Radio value={0}>Minimized</Radio><Radio value={1}>Expanded</Radio>
                                </Radio.Group>
                            </Form.Item>
                            <Form.Item {...formItemLayout} label="Show review date" >
                                <FedoSwitch isOn = { this.state.config.settings.showReviewDate } onChange = { this.getConfigHandlerFor('settings.showReviewDate') }/>
                            </Form.Item>
                            <Form.Item {...formItemLayout} label="Limit number of reviews to" >
                                <InputNumber min={1} max={this.state.config.licenseReviewLimit} value = { this.state.config.settings.maxReviews } 
                                    onChange = { this.getConfigHandlerFor('settings.maxReviews') }/>
                            </Form.Item>
                        </Form>
                    </section>
                    <section className={'DesignSettings'}>
                        <h3>Design</h3>
                        <DecoratedDesignForm key={(new Date()).getTime()} parentState={this.state} getConfigHandlerFor={ this.getConfigHandlerFor.bind(this) }/>
                    </section>

                 </div>
             </Layout.Content>
             <Layout.Footer className={'CreateCampaign-Footer'} style={{position:'relative'}}>
                <div style={{width: '89%'}}>
                    <Button className={'fedoBtn'} type='primary' style={{width: 100}} onClick={ this.saveSettings }>Save</Button>
                    <Button className={'fedoBtn'}  style={{marginLeft: 20, fontSize: 11}} onClick={ this.restoreDefaults.bind(this) }>Restore Default</Button>
                </div>
             </Layout.Footer>
         </Layout>
        );
    }
}


var FedoSwitch = (props) => {
    return (
        <span>
            <Switch key={(new Date()).getTime()} defaultChecked={ props.isOn } onChange={ props.onChange }/>
            { props.isOn? <span className="switch-on">( ON )</span>: <span className="switch-off">( OFF )</span> }
        </span>
    );
};

class DesignForm extends Component {

    handleFormSubmission(e) {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, value) => {
            if (!err) {
                var values = this.props.form.getFieldsValue(),
                    keys = Object.keys(values);
                for (var k=0; k<keys.length; k+=1) {
                    var key = keys[k].split('_').join('.');
                    this.props.getConfigHandlerFor(key)(values[keys[k]]);

                }

                SettingsApi.saveWidgetConfig(this.props.parentState.config)
                    .then(function (data) {
                        let fn, title;
                        if (data.success) {
                            fn = notification.success;
                            title = 'Success';       
                        } else {
                            fn = notification.error;
                            title = 'Error';
                        }

                        fn({message: title, description: data.msg});
                    });
            } 
        });
    }

    render() {
        const RGBREGEX = /^#[0-9a-f]{6}$/i;
        const { getFieldDecorator } = this.props.form;
        return (
            <Form onSubmit = { this.handleFormSubmission.bind(this) } >
                <Form.Item {...formItemLayout} label="Background color for open state" id='design_backgroundColorOpen'>
                    { getFieldDecorator('design_backgroundColorOpen', { initialValue: this.props.parentState.config.design.backgroundColorOpen, 
                                                   rules: [{pattern: RGBREGEX, message: 'Only #rrggbb format is allowed.' }]})(
                        <Input />
                    )}
                </Form.Item>
                <Form.Item {...formItemLayout} label="Font color" id='design_fontColor'>
                    { getFieldDecorator('design_fontColor', { initialValue: this.props.parentState.config.design.fontColor, 
                                                   rules: [{pattern: RGBREGEX, message: 'Only #rrggbb format is allowed.' }]})(
                        <Input />
                    )}
                </Form.Item>
                <Form.Item {...formItemLayout} label="Rating icon color" id='design_ratingIconColor'>
                    { getFieldDecorator('design_ratingIconColor', { initialValue: this.props.parentState.config.design.ratingIconColor, 
                                                   rules: [{pattern: RGBREGEX, message: 'Only #rrggbb format is allowed.' }]})(
                        <Input />
                    )}
                </Form.Item>
                <Form.Item {...formItemLayout} label="Outreech fav icon color" id='design_outreechFavColor' >
                    { getFieldDecorator('design_outreechFavColor', { initialValue: this.props.parentState.config.design.outreechFavColor, 
                                                   rules: [{pattern: RGBREGEX, message: 'Only #rrggbb format is allowed.' }]})(
                        <Input />
                    )}

                </Form.Item>
                <Button id='designSettingsForm' style={{display: 'none'}} htmlType='submit'></Button>
            </Form>
        );
    }
}

let DecoratedDesignForm = Form.create({})(DesignForm);
export default WidgetSettings;
