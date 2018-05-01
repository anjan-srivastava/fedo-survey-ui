import React from 'react';

import './widget.css';

/** For now this component is stateless**/

let WidgetPreview = (props) => {
    return (
        <div>
            <div className="orw-card-w " style={ props.style }>
                <div className="orw-card " style= {{ backgroundColor: props.backgroundColorOpen }} >
                    <div className="widget-title clearfix " style={{border: (props.titleEnabled?'':'none')}}>
                        <span style= {{ color: props.titleFontColor, display: (props.titleEnabled? 'inline':'none') }} >{ props.titleText }</span>
                        <i className="fa close "></i>
                    </div>
                    <h5 className="clearfix ">
                        <div className="title clearfix ">
                            <div style={{ color: props.nameFontColor, display: (props.showReviewerName? 'block':'none') }} >Sid gopin</div>
                            <div>
                                <i className="fa fa-star filled " style={{ color: props.ratingIconColor }} ></i>
                                <i className="fa fa-star filled " style={{ color: props.ratingIconColor }} ></i>
                                <i className="fa fa-star filled " style={{ color: props.ratingIconColor }} ></i>
                                <i className="fa fa-star empty "  ></i>
                                <i className="fa fa-star empty "  ></i>
                            </div>
                        </div>
                        <div className="extra " style = {{ display: (props.showReviewDate? 'block':'none') }}>Apr 19, 2018</div>
                    </h5>
                    <p>
                        <q style= {{ color: props.fontColor }} >Integrating the widget almost instantly increased our conversions by 25-30% a day. It's one of the best investments we've made!</q>
                    </p>
                    <div className="poweredByText ">
                        <span>
                            <i className="fa fa-bolt "></i>
                            <a href="http://outreech.io" target="blank">by OutReech</a>
                        </span>
                    </div>
                </div>
            </div>
            <div style={{textAlign: 'left', padding: '0 20px'}}><div className="fa fa-heart head" style= {{ color: props.outreechFavColor }}></div></div>
        </div>
    );
};

export default WidgetPreview;

