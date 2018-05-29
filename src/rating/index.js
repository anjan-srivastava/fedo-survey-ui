import React, { Component } from 'react';
import { Button, Input, Radio } from 'antd';
import './style.css';

class Rating extends Component {
    render() {
        var stars = [],
            maxRating = this.props.max || 5,
            enableTextFeedback = this.props.feedbackBox || true,
            group = "star" + (new Date()).getTime();
        for(var i=maxRating; i >0 ; i -= 1) {
            var key = "star_" + (new Date()).getTime() + "_" + i;
            stars.push(<Star key={key} rating={i} max={maxRating} group={group} />);
        }

        var textbox = null;
        if (enableTextFeedback) {
            textbox = <FeedbackBox />;       
        }
        return (
            <form name="feedbackForm" id="feedbackForm"
                action="#" method="POST">
                <div className="rating theme-default" >
                    <h4>Rate the feature</h4>
                    <Radio.Group style = {{marginBottom: 40}}>
                        {stars}
                    </Radio.Group>
                    <h4>Feedback for us</h4>
                    {textbox}
                </div>
                <p style={{textAlign: 'center'}}><Button style={{fontSize: 14}} type="primary">{ this.props.btnText }</Button></p>      
            </form>
        );
    }
}

class Star extends Component {
    render() {
        var id = this.props.group + "_" + this.props.rating;
        var stars = [];
        for(var i=0; i < this.props.rating; i+=1 ) stars.push(<i key={ id + "_" + i } className="fa fa-star Feedback-ratingStar" />); 
        return (
            <span style = {{marginRight: 2, lineHeight:2 }}>
                <Radio name={this.props.group}
                    id={id} value={this.props.rating} disabled={ true }/>
                <label htmlFor={id}>{ stars }</label>
            </span>
        );
    }
}

class FeedbackBox extends Component {
    render() {
        return (
            <Input.TextArea placeholder="Write your feedback here" rows={5} style = {{width: '100%', fontSize: 16, marginBottom: 40, resize: 'none'}} readOnly = {true}/>      
        );
    }
}
export default Rating;
