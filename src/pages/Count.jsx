import React, {Component} from "react";
export default class Count extends Component {
    constructor(props){
        super(props);
        this.state = {
            count: 0
        }
    }
    handleClick(){
        this.setState({
            count: ++this.state.count
        })
    }
    render(){
        return (
            <div style={{textAlign: "center"}}>
                <p>当前Count的值：<span>{this.state.count}</span></p>
                <button style={{ border:'1px dashed blue' }} onClick={this.handleClick.bind(this)}>加1</button>
            </div>
        )
    }
}