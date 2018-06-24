import React from 'react';

import './carousel.css';

/** For now this component is stateless**/

let CarouselPreview = (props) => {
    return (
           <div style={ props.style }>
              <div className="content " style={{ background: props.backgroundColorCarousel }} >
                 <div className="widget-title clearfix " style={{color: props.titleFontColor}}>
                    <span style={{display: props.titleEnabled? 'inline': 'none'}}> { props.titleText } </span>
                    <div className="summary " style={{display: props.avgRatingEnabled?'block':'none'}}><span className="rating ">3.5</span><span style={{margin: '0px 5px'}}><i className="fa fa-star filled " style={{color: props.ratingIconColor }}></i><i className="fa fa-star filled " style={{color: props.ratingIconColor }}></i><i className="fa fa-star filled " style={{color: props.ratingIconColor}}></i><i className="fa fa-star-half filled " style={{color: props.ratingIconColor }}></i><i className="fa fa-star empty "></i><i className="fa fa-star empty "></i></span><span className="extra ">based on 3 reviews</span></div>
                 </div>
                 <div>
                    <div className="siema owl-carousel owl-loaded owl-drag owl-grab">
                             <div className="owl-item active" style={{width: 358 }}>
                                <div className="orw-card-w ">
                                   <div className="orw-card " style={{backgroundColor: props.backgroundColorOpen }}>
                                      <h5>
                                         <div className="title clearfix ">
                                            <div><i className="fa fa-star filled " style={{ color: props.ratingIconColor }}></i><i className="fa fa-star filled " style={{color: props.ratingIconColor }}></i><i className="fa fa-star empty "></i><i className="fa fa-star empty "></i><i className="fa fa-star empty "></i></div>
                                         </div>
                                      </h5>
                                      <p><q style={{color: props.fontColor }}>Integrating the widget almost instantly increased our conversions by 25-30% a day. It's one of the best investments we've made!</q></p>
                                      <h5 className="username clearfix " style={{display: props.showReviewerName?'block':'none'}}>
                                         <div style={{ color: props.nameFontColor }}>Sid Gopin</div>
                                      </h5>
                                   </div>
                                </div>
                             </div>
                    </div>
                 </div>
                 <div className="poweredByText "><span><i className="fa fa-bolt "></i><a href="http://outreech.io" target="blank">by OutReech</a></span></div>
              </div>
           </div>
        );
};

export default CarouselPreview;


