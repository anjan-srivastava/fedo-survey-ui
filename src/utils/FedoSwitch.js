import React from 'react';
import { Switch } from 'antd';

var FedoSwitch = (props) => {
    return (
        <span>
            <Switch key={(new Date()).getTime()} defaultChecked={ props.isOn } onChange={ props.onChange }/>
            { props.isOn? <span className="switch-on">( ON )</span>: <span className="switch-off">( OFF )</span> }
        </span>
    );
};

export default FedoSwitch;
