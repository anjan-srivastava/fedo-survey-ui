import React, { Component } from 'react';
import { Layout, Form, Button, Select, Spin, Switch, Radio, InputNumber, Input, Affix, notification, message } from 'antd';

import ColorPicker from '../colorpicker';
import SettingsApi from '../settings/SettingsApi.js';
import SurveyApi from '../survey/SurveyApi.js';
import CarouselPreview from './CarouselPreview.js';

import myintro from '../myintro.js';

const formItemLayout = {
    labelCol: { span: 11 },
    wrapperCol: { span: 13 },
};

class CarouselSettings extends Component {
    state = { widgetLink: "",
        config: {
            licenseReviewLimit: 10,
            settings: {
                enabled: true,
                scrollEnabled: false,
                titleEnabled: true,
                titleText: 'What our cutomers say about us!',
                avgRatingEnabled: true,
                showReviewerName: true,
                //showReviewDate: true,
                maxReviews: 3
            },
            design: {
                backgroundColorOpen: '#ffffff',
                backgroundColorCarousel: '#550078',
                titleFontColor: '#495864',
                nameFontColor: '#000000',
                fontColor: '#333333',
                ratingIconColor: '#ffc719',
            }
        },


        filterFetching: false,
        filterData: []

    };

    fetchCampaignList() {
        this.setState(Object.assign({}, this.state, {filterFetching: true}));
        SurveyApi.listAll()
            .then((surveys) => {
                this.setState(Object.assign({}, this.state, {filterFetching: false, filterData: surveys}));
            });
    }

    filterOnChange(value) {
        this.setState(Object.assign({}, this.state, {filterValue: value}));
    }

    genCode() {
        if (!this.state.filterValue) {
            message.error('Please select a campagin.');
            return; 
        }

        SettingsApi.getWidgetLink()
            .then((data) => {
                let url = data.url;
                url = url.replace('widget.js', 'carousel.js');
                url += '?p=' + this.state.filterValue;
                this.setState(Object.assign({}, this.state, {codeGenerated: true, widgetLink: url}))
            });
    }

    componentDidMount() {
        SettingsApi.getWidgetLink()
        .then(function(data) {
            this.setState(Object.assign({}, this.state, { widgetLink: data.url }));
            
            SettingsApi.getCarouselConfig()
            .then(function (config) {
                this.setState(Object.assign({}, this.state, {config: config}));

                // myintro("/feedbacks");
            }.bind(this));  
            
        }.bind(this));
    }

    restoreDefaults(e) {
        SettingsApi.restoreCarouselDefaults()
            .then(function (res) {
                var fn, title;
                if (res.success) {
                    title = 'Success';
                    fn = notification.success;
                    this.setState(Object.assign({}, this.state, {config: res.carouselConfig}));
                } else {
                    title = 'Error';
                    fn = notification.error;
                }

                fn({message: title, description: res.msg});
            }.bind(this));
    }

    saveSettings(e) {
        document.getElementById('designSettingsFormCarousel').click();    
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
                                <span>Generate and Embed Code</span>
                            </h3>
                            <div>
                                <Select
                                    labelInValue = { false }
                                    value={this.state.filterValue}
                                    notFoundContent={this.state.filterFetching? <Spin size="small" />: null}
                                    filterOption = {false}
                                    onSearch = { this.fetchCampaignList.bind(this) }
                                    onFocus = { this.fetchCampaignList.bind(this) }
                                    onChange = { this.filterOnChange.bind(this) }
                                    placeholder="Select campaign" 
                                    style={{ width: 300}}>
                                    
                                    <Select.OptGroup key = "Labels">
                                        { this.state.filterData.map((d)=> <Select.Option key={d.surveyKey}>{d.title}</Select.Option>)}
                                    </Select.OptGroup>
                                </Select>

                                <Button type="primary" ghost style={{margin: '0 15px'}} onClick= { this.genCode.bind(this) }> Generate Code </Button>
                            </div>
                            <p style={{display: this.state.codeGenerated? 'block': 'none', margin: '20px 0'}}>
                                 <div className='App-textMeta'> { "Copy and paste this code below to part of your page where you want it to be displayed." } </div>
                                <code>
                                <Input.TextArea key={(new Date()).getTime()} size='large' readOnly={true} style={{fontSize: 13, padding: '10px', resize: 'none'}} rows={2} onClick={this.copyToClipBoard} data-intro="Hey! It's great to have you with us. Let's get you set up :) . To begin, you need to copy & paste this code snippet on your website page. The widget will only start working once you paste this code." data-step="1">
                                { 
                                    "<script id='outreech-carousel' async type='text/javascript' src='" + this.state.widgetLink +"'></script>"
                                }
                                </Input.TextArea>
                                </code>
                            </p>
                        </section>

                        <section className={'Settings'}>
                            <h3>Settings</h3>
                            <Form>
                                <Form.Item {...formItemLayout} label="Display widget on website" >
                                    <FedoSwitch isOn = { this.state.config.settings.enabled } onChange = { this.getConfigHandlerFor('settings.enabled') }/>
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
                                <Form.Item {...formItemLayout} label="Display average rating" >
                                    <FedoSwitch isOn = { this.state.config.settings.avgRatingEnabled } onChange = { this.getConfigHandlerFor('settings.avgRatingEnabled') }/>
                                </Form.Item>
                                <Form.Item {...formItemLayout} label="Display reviewer name" >
                                    <FedoSwitch isOn = { this.state.config.settings.showReviewerName } onChange = { this.getConfigHandlerFor('settings.showReviewerName') }/>
                                </Form.Item>
                                {/* 
                                    <Form.Item {...formItemLayout} label="Show review date" >
                                    <FedoSwitch isOn = { this.state.config.settings.showReviewDate } onChange = { this.getConfigHandlerFor('settings.showReviewDate') }/>
                                </Form.Item>
                                */}
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
                 
                <Layout.Sider width= { 450 } style={{background: '#fff'}}>
                    <Affix style={{background: '#fff'}}>
                        <div style = {{ height: '100vh', padding: 16  }} 
                                        className="Feedback-Sider-Right App-checkedBackground" 
                            id={ "outreech-carousel-container" }>
                           <CarouselPreview style={{ marginTop: 164 }}
                                showReviewerName = { this.state.config.settings.showReviewerName }
                                titleEnabled = { this.state.config.settings.titleEnabled }
                                titleText = { this.state.config.settings.titleText }
                                avgRatingEnabled = { this.state.config.settings.avgRatingEnabled } 
                                backgroundColorOpen = { this.state.config.design.backgroundColorOpen }
                                backgroundColorCarousel = { this.state.config.design.backgroundColorCarousel }
                                titleFontColor = { this.state.config.design.titleFontColor }
                                nameFontColor = { this.state.config.design.nameFontColor }
                                fontColor = { this.state.config.design.fontColor }
                                ratingIconColor = { this.state.config.design.ratingIconColor }
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

                SettingsApi.saveCarouselConfig(this.props.parentState.config)
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
                <Form.Item {...formItemLayout} label="Carousel Card Color" id='design_backgroundColorOpen'>
                    { getFieldDecorator('design_backgroundColorOpen', { initialValue: this.props.parentState.config.design.backgroundColorOpen, 
                                                   rules: [{pattern: RGBREGEX, message: 'Only #rrggbb format is allowed.' }]})(
                        <Input onChange = { this.props.getConfigHandlerFor('design.backgroundColorOpen') } />
                    )}

                    <ColorPicker color={ this.props.parentState.config.design.backgroundColorOpen } onChange = {
                        (color) => this.props.getConfigHandlerFor('design.backgroundColorOpen')(color.hex)
                    }/>
                </Form.Item>
                
                <Form.Item {...formItemLayout} label="Carousel Background Color" id='design_backgroundColorCarousel'>
                    { getFieldDecorator('design_backgroundColorCarousel', { initialValue: this.props.parentState.config.design.backgroundColorCarousel, 
                                                   rules: [{pattern: RGBREGEX, message: 'Only #rrggbb format is allowed.' }]})(
                        <Input onChange = { this.props.getConfigHandlerFor('design.backgroundColorCarousel') } />
                    )}

                    <ColorPicker color={ this.props.parentState.config.design.backgroundColorCarousel } onChange = {
                        (color) => this.props.getConfigHandlerFor('design.backgroundColorCarousel')(color.hex)
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

                <Button id='designSettingsFormCarousel' style={{display: 'none'}} htmlType='submit'></Button>
            </Form>

        );
    }
}

let DecoratedDesignForm = Form.create({})(DesignForm);
export default CarouselSettings;
                            
 

