import React, { Component } from 'react';
import { Layout, Button, Row, Col, Breadcrumb, Input, Upload, Form, Table } from 'antd';

import EditableTagGroup from '../editableTagGroup';
import CreateEmail from './CreateEmail.js';
import SurveyApi from './SurveyApi.js';

import './style.css';

const addRecepientStateStorageKey = 'AddRecepientContentState';

class CreateCampaignView extends Component {
  surveyData = { }
  componentDidMount() {
      if (this.props.match.params.surveyKey) {
          SurveyApi.getSurvey(this.props.match.params.surveyKey).then((function(data) {
            this.surveyData = data;
            this.setState(Object.assign({}, this.state, 
                        { contentView: (<AddRecepients.Content key={ this.props.match.params.surveyKey } 
                                onContinue = { this.continueToEmail.bind(this) } 
                                recepients={ data.recepients } />)}))
          }).bind(this));  
      }
  }


  addRecepientsContentView = (<AddRecepients.Content  onContinue = { this.continueToEmail.bind(this) } />);
  addRecepientsFooterView = (<AddRecepients.Footer  />);
  state = { contentView: this.addRecepientsContentView, 
    footerView: this.addRecepientsFooterView }

  handleBreadcrumbClick(event) {
    event.preventDefault();
    const oldAddRecepientStateJson = localStorage.getItem(addRecepientStateStorageKey);
    let recepients;
    let fileList;
    if (oldAddRecepientStateJson) {
        const oldState = JSON.parse(oldAddRecepientStateJson);
        oldState && (recepients = oldState.recepients);
        oldState && (fileList = oldState.fileList);
    }

    this.setState(Object.assign({}, this.state,
        { 
            contentView: (<AddRecepients.Content key={ (new Date()).getTime() }
                onContinue = { this.continueToEmail.bind(this) }
                recepients={  recepients || [] } 
                fileList = { fileList || [] }/>),
            footerView: this.addRecepientsFooterView
        
        }));
  }

  render() {
    return (
        <Layout style ={{background: '#fff'}}>
        
            <Row style={{borderBottom: 'solid 1px #e3e5e6', padding: '14px 24px'}}>
                <Col span={24}>
                    <Breadcrumb separator=">" style={{fontSize: '12px'}}>
                        <Breadcrumb.Item><a href="#" onClick={this.handleBreadcrumbClick.bind(this)}>Add Recepients</a></Breadcrumb.Item>
                        <Breadcrumb.Item>Create Email</Breadcrumb.Item>
                    </Breadcrumb>
                </Col>
            </Row> 
            <Layout.Content style={{marginBottom: 55}}>
                { this.state.contentView }
            </Layout.Content>
            <Layout.Footer className="CreateCampaign-Footer">
                { this.state.footerView }
            </Layout.Footer>
        </Layout>
    );
  }

  continueToEmail(recepients) {
    this.setState({contentView: (<CreateEmail.Content 
                                    survey = { this.surveyData }
                                    recepients={ recepients }
                                    surveyKey={ this.props.match.params.surveyKey } />), footerView: (<CreateEmail.Footer />)});    
  }
}

class AddRecepientContent extends Component {
      MAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      state = { uploadDisabled: false, fileList: this.props.fileList || [], recepients: this.props.recepients || [] }

      componentWillMount() {
        // clear old state
        localStorage.setItem(addRecepientStateStorageKey, null);
      }

      handleSubmit(e) {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll({force: true}, (err, values)=> {
            if (!err) {
                localStorage.setItem(addRecepientStateStorageKey, JSON.stringify(this.state)); 
                this.props.onContinue(this.state.recepients);               
            }
        });
      }


      uploadOnChange({file, fileList}) {
            if (file.status === 'uploading' && fileList.length >= 1) {
                this.setState(Object.assign({}, this.state, { uploadDisabled: true }));
            } else {
                this.setState(Object.assign({}, this.state, { fileList: [ file ]}));
            }
      }

      validateRecpients(rule, value, callback) {
            if (value && !value.every((t)=>this.MAIL_REGEX.test(t))) {
                callback("Invalid email id: " + value[value.length-1]);
            } else if ( (!value || !value.length) && !this.state.fileList.length) {
                callback("Please add recepients to continue");
            } else {
                this.setState(Object.assign({}, this.state, {recepients: value} ));
                callback();
            }

      }

      render() {
            const { getFieldDecorator }  = this.props.form;
            const recepValidator = this.validateRecpients.bind(this);
            const uploadWatcher = this.uploadOnChange.bind(this);
            const initialRecepients = this.props.recepients;

            const csvEmailColumns = [{ title: 'Email', dataIndex: 'email', key: 'email' }];
            const sampleEmails = [ { key: '1', email: 'admin@fedo.com'}, { key: '2', email: 'support@fedo.com'} ];
            return (
                <Row style={{padding: 24}}>
                    <Form id="id_recepientsForm" onSubmit={ this.handleSubmit.bind(this) }>
                        <Row>
                            <Col span= {12}>
                                <Form.Item>
                                    <h4 id='id_addEmail' >Add Email(s)</h4>
                                    <div style={{border: 'solid 1px #e3e5e6', borderRadius: 2, padding: 8}}>
                                        { getFieldDecorator('id_addEmail', { rules:[{
                                            validator: recepValidator
                                        }] })(<EditableTagGroup  initialValue={ initialRecepients }/>) }
                                    </div>
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row style={{color: '#aaa', margin: '20px 0' }}>
                            <Col span={12}>
                                or
                            </Col>
                        </Row>
                        <Row>
                            <Col span={12}>
                                <Form.Item>
                                    <h4 id="id_uploadCSV">Upload CSV</h4>

                                    {getFieldDecorator('id_uploadCSV', { valuePropName: 'recepients'})(
                                        <Upload onChange={ uploadWatcher } action="/api/recepients/import"
                                            name="recepients"
                                            onRemove = { ((file)=>{ this.setState(Object.assign({}, this.state, {uploadDisabled: false})); }) }
                                            disabled = { this.state.uploadDisabled }
                                            withCredentials = { true }
                                            defaultFileList = { this.state.fileList }>
                                            <Button type="primary" style={{width: 150}} disabled={ this.state.uploadDisabled }>Upload a CSV</Button>
                                        </Upload>
                                    )}
                                </Form.Item>

                               <Form.Item>
                                    <Button htmlType="submit" style={{width:0,height:0,position:'absolute',top:-9999,left:-9999}}
                                        id="id_recepientsFormSubmitBtn">.</Button>
                               </Form.Item>
                           </Col>
                           <Col span={6} push={6} style={{padding: 24}}>
                                <h5>Make sure that the .csv file you upload is in the following format: </h5>
                                <Table dataSource={sampleEmails} columns={csvEmailColumns} pagination={ false }/>
                           </Col>
                        </Row>
                    </Form>
                </Row>
            );
    }
}


var AddRecepients = {
    Footer: (props) => {
        return (
            <Button type="primary" style={{width: 100}} onClick={ ()=>{document.getElementById('id_recepientsFormSubmitBtn').click();} }>Continue</Button>
        ); 
    }
};

AddRecepients.Content = Form.create({})(AddRecepientContent);

export default CreateCampaignView;
