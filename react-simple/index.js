

import React from './react';
import ReactDOM from './react-dom';

const ele=(
    <div className='active' title='123'>
        hello，<span class='red'>react</span>
    </div>
)

// function  Home() {
//     return(
//         <div className='active' title='123'>
//             hello，<span class='red'>react</span>
//         </div>
//     )
// }

class Home extends React.Component{
    constructor(props){
        super(props)
        this.state={
            num: 0
        }
    }
    componentWillMount(){
        console.log('组件将要加载')
    }
    componentWillReceiveProps(props){
        console.log('props')
    }
    componentWillUpdate(){
        console.log('组件将要更新')
    }
    componentDidUpdate(){
        console.log('组件更新完成')
    }
    componentDidMount(){
        console.log('组件加载完成')
        for(let i=0;i<10;i++){
            this.setState((prevState, prevProps)=>{
                console.log('@@@@')
                console.log(prevState)
                return {
                    num: prevState.num + 1
                }
            })
        }
    }
    handleClick(){
        // 修改状态的唯一方法是调用setState
        this.setState({
            num: this.state.num + 1
        })
    }
    render(){
        return(
            <div className='active' title='123'>
                hello，<span class='red'>react {this.state.num}</span>
                <button onClick={this.handleClick.bind(this)}>摸我</button>
            </div>
        )
    }
}

// console.log(<Home name={name}/>)

// 字符串
// ReactDOM.render('react',document.querySelector('#root'))

// es6类组件
ReactDOM.render(<Home />,document.querySelector('#root'))


// ReactDOM.render(ele,document.querySelector('#root'))