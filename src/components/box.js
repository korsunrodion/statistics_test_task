import React from 'react';
import './css/box.css';

function Box(props) {
    let view;
    if (Array.isArray(props.value)) {
        const listItems = props.value.map((value) => 
            <li>{value}</li>
        );
        view = <ul className="box_main">{listItems}</ul>;
    } else {
        view = <span className="box_main">{props.value}</span>;
    }

    return (
        <div className="box">
            <h3>{props.header}</h3>
            {view}
            <span className="box_subtext">{props.subtext}</span>
        </div>
    );
};

export default Box;