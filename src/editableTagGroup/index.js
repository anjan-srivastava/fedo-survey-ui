import React, { Component } from 'react';
import { Tag, Input, Tooltip, Icon } from 'antd';

class EditableTagGroup extends Component {
  showAddBtn = this.props.addBtn;
  state = {
    tags: this.props.initialValue || [],
    inputVisible: !this.showAddBtn,
    inputValue: '',
  };

  onChangeCallback = (typeof this.props.onChange === 'function' &&
                        this.props.onChange) || function() { }

  componentDidMount() {
    console.log("tagGroup", this.props.initialValue);
    if (this.state.tags && this.state.tags.length) {
        this.onChangeCallback(this.state.tags);
    }
  }

  handleClose = (removedTag) => {
    const tags = this.state.tags.filter(tag => tag !== removedTag);
    this.setState({ tags });
    this.onChangeCallback(tags);
  }

  showInput = () => {
    this.setState({ inputVisible: true }, () => this.input.focus());
  }

  handleInputChange = (e) => {
    this.setState({ inputValue: e.target.value });
  }

  handleInputConfirm = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const state = this.state;
    const inputValue = state.inputValue;
    let tags = state.tags;
    if (inputValue && tags.indexOf(inputValue) === -1) {
      tags = [...tags, inputValue];
    }
    this.setState({
      tags,
      inputVisible: !this.showAddBtn,
      inputValue: '',
    });

    this.onChangeCallback(tags);
  }

  saveInputRef = input => this.input = input

  render() {
    var { tags, inputVisible, inputValue } = this.state;

    return (
      <div onClick={ (()=>{ if(!this.showAddBtn) this.showInput() }) }>
        {tags.map((tag, index) => {
          const isLongTag = tag.length > 20;
          const tagElem = (
            <Tag key={tag} closable={ true } afterClose={() => this.handleClose(tag)} style={{margin: 4}}>
              {isLongTag ? `${tag.slice(0, 20)}...` : tag}
            </Tag>
          );
          return isLongTag ? <Tooltip title={tag} key={tag}>{tagElem}</Tooltip> : tagElem;
        })}
        {inputVisible && (
          <Input
            ref={this.saveInputRef}
            type="text"
            size="default"
            className="noborder"
            style={{ width: 'auto', margin: 4 }}
            value={inputValue}
            onChange={this.handleInputChange}
            onBlur={this.handleInputConfirm}
            onPressEnter={this.handleInputConfirm}
          />
        )}
        {!inputVisible && this.showAddBtn && (
          <Tag style={{margin: 4}}
            onClick={this.showInput}
          >
            <Icon type="plus" /> New Label
          </Tag>
        )}
      </div>
    );
  }
}


export default EditableTagGroup;
