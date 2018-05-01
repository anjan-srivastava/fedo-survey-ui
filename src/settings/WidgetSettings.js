import React, { Component } from 'react';
import { Layout, Form, Button, Switch, Radio, InputNumber, Input, Affix, notification, message } from 'antd';

import ColorPicker from '../colorpicker';
import WidgetPreview from './WidgetPreview.js';
import SettingsApi from './SettingsApi.js';

import myintro from '../myintro.js';

const formItemLayout = {
    labelCol: { span: 11 },
    wrapperCol: { span: 13 },
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
                ratingIconColor: '#ffc719',
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

                myintro("/feedbacks");
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
            <Layout>
                 <Layout.Content style={{ backgroundColor: '#fff'}}>
                     <div style={{ padding: '0 30px' }}>
                        <section>
                            <h3>
                                <span>Embed Code</span>
                            </h3>
                             <div className='App-textMeta'> { "Copy and paste this code below just before the </head> tag of your page. Make sure you paste the code on every page where you want the widget to be displayed." } </div>
                            <code>
                            <Input.TextArea key={(new Date()).getTime()} size='large' readOnly={true} style={{fontSize: 13, padding: '10px', resize: 'none'}} rows={2} onClick={this.copyToClipBoard} data-intro="Hey! It's great to have you with us. Let's get you set up :) . To begin, you need to copy & paste this code snippet on your website page. The widget will only start working once you paste this code." data-step="1">
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
                                    <InputNumber min={1} max={this.state.config.licenseReviewLimit} value = { Math.min(this.state.config.settings.maxReviews, this.state.config.licenseReviewLimit) } 
                                        onChange = { this.getConfigHandlerFor('settings.maxReviews') }/>
                                </Form.Item>
                            </Form>
                        </section>
                        <section className={'DesignSettings'}>
                            <h3>Design</h3>
                            <DecoratedDesignForm  parentState={this.state} getConfigHandlerFor={ this.getConfigHandlerFor.bind(this) }/>
                        </section>

                     </div>
                     
                     
                                     
                 </Layout.Content>
                <Layout.Sider width= { 400 } style={{background: '#fff'}}>
                    <Affix style={{background: '#fff'}}>
                        <div style = {{ height: '100vh', padding: 16  }} 
                                        className="Feedback-Sider-Right App-checkedBackground" 
                            id={ "outreech-widget-container" }>

                            <WidgetPreview style={{ margin: '144px 24px 24px 24px' }} 
                                showReviewerName = { this.state.config.settings.showReviewerName }
                                showReviewDate = { this.state.config.settings.showReviewDate }
                                titleText = { this.state.config.settings.titleText }
                                titleEnabled = { this.state.config.settings.titleEnabled }
                                backgroundColorOpen = { this.state.config.design.backgroundColorOpen }
                                titleFontColor = { this.state.config.design.titleFontColor }
                                nameFontColor = { this.state.config.design.nameFontColor }
                                fontColor = { this.state.config.design.fontColor }
                                ratingIconColor = { this.state.config.design.ratingIconColor }
                                outreechFavColor = { this.state.config.design.outreechFavColor }
                                />

                        </div>
                    </Affix>
                </Layout.Sider>
             </Layout>   
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
    
    componentWillReceiveProps(nextProps) {
        let designConfig = nextProps.parentState.config.design,
            update = {}, currentValues = this.props.form.getFieldsValue(),
            needsUpdate = false;
        
        for (var prop in designConfig) {
            if ( designConfig.hasOwnProperty(prop) ) {
                const k = 'design_' + prop;
                update[k] = designConfig[prop];
                if (update[k] != currentValues[k]) needsUpdate = true;
            }
        }

        if (needsUpdate) this.props.form.setFieldsValue(update);
    }

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
                        <Input onChange = { this.props.getConfigHandlerFor('design.backgroundColorOpen') } />
                    )}

                    <ColorPicker color={ this.props.parentState.config.design.backgroundColorOpen } onChange = {
                        (color) => this.props.getConfigHandlerFor('design.backgroundColorOpen')(color.hex)
                    }/>
                </Form.Item>
                
                
                <Form.Item {...formItemLayout} label="Title font color" id='design_titleFontColor'>
                    { getFieldDecorator('design_titleFontColor', { initialValue: this.props.parentState.config.design.titleFontColor, 
                                                   rules: [{pattern: RGBREGEX, message: 'Only #rrggbb format is allowed.' }]})(
                        <Input onChange = { this.props.getConfigHandlerFor('design.titleFontColor') } />
                    )}
                    <ColorPicker key={'backgroundColorOpen'} color={ this.props.parentState.config.design.titleFontColor } onChange = {
                        (color) => this.props.getConfigHandlerFor('design.titleFontColor')(color.hex)
                    }/>

                </Form.Item>
                
                <Form.Item {...formItemLayout} label="Reviewer name font color" id='design_nameFontColor'>
                    { getFieldDecorator('design_nameFontColor', { initialValue: this.props.parentState.config.design.nameFontColor, 
                                                   rules: [{pattern: RGBREGEX, message: 'Only #rrggbb format is allowed.' }]})(
                        <Input onChange = { this.props.getConfigHandlerFor('design.nameFontColor') } />
                    )}
                    <ColorPicker key={'nameFontColor'} color={ this.props.parentState.config.design.nameFontColor } onChange = {
                        (color) => this.props.getConfigHandlerFor('design.nameFontColor')(color.hex)
                    }/>
                </Form.Item>


                <Form.Item {...formItemLayout} label="Font color" id='design_fontColor'>
                    { getFieldDecorator('design_fontColor', { initialValue: this.props.parentState.config.design.fontColor, 
                                                   rules: [{pattern: RGBREGEX, message: 'Only #rrggbb format is allowed.' }]})(
                        <Input onChange = { this.props.getConfigHandlerFor('design.fontColor') } />
                    )}
                    <ColorPicker key={'fontColor'} color={ this.props.parentState.config.design.fontColor } onChange = {
                        (color) => this.props.getConfigHandlerFor('design.fontColor')(color.hex)
                    }/>
                </Form.Item>
                <Form.Item {...formItemLayout} label="Rating icon color" id='design_ratingIconColor'>
                    { getFieldDecorator('design_ratingIconColor', { initialValue: this.props.parentState.config.design.ratingIconColor, 
                                                   rules: [{pattern: RGBREGEX, message: 'Only #rrggbb format is allowed.' }]})(
                        <Input onChange = { this.props.getConfigHandlerFor('design.ratingIconColor') } />
                    )}
                    <ColorPicker key={'ratingIconColor'} color={ this.props.parentState.config.design.ratingIconColor } onChange = {
                        (color) => this.props.getConfigHandlerFor('design.ratingIconColor')(color.hex)
                    }/>
                </Form.Item>
                <Form.Item {...formItemLayout} label="Outreech fav icon color" id='design_outreechFavColor' >
                    { getFieldDecorator('design_outreechFavColor', { initialValue: this.props.parentState.config.design.outreechFavColor, 
                                                   rules: [{pattern: RGBREGEX, message: 'Only #rrggbb format is allowed.' }]})(
                        <Input onChange = { this.props.getConfigHandlerFor('design.outreechFavColor') } />
                    )}
                    <ColorPicker key={'outreechFavColor'} color={ this.props.parentState.config.design.outreechFavColor } onChange = {
                        (color) => this.props.getConfigHandlerFor('design.outreechFavColor')(color.hex)
                    }/>

                </Form.Item>
                <Button id='designSettingsForm' style={{display: 'none'}} htmlType='submit'></Button>
            </Form>

        );
    }
}

let DecoratedDesignForm = Form.create({})(DesignForm);
export default WidgetSettings;
