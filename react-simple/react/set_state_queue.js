import { renderComponent } from '../react-dom'

/*
1、异步更新state 短时间内把多个setState合并一个队列（队列：先进先出）
2、一段时间之后，循环清空队列，渲染组件
*/
const setStateQueue = []
// 保存当前组件
const renderQueue = []
function defer(fn){
    return Promise.resolve().then(fn) // 相当于延迟调用
}
export function enqueueSetState(stateChange, component){
    // 延迟调用方法
    if(setStateQueue.length === 0){
        // setTimeout(()=>{
        //     flush()
        // }, 0)
        defer(flush)
    }

    // 1.短时间内合并多个setState
    setStateQueue.push({
        stateChange,
        component
    })
    // 如果renderQueue里面没有组件，添加到队列中
    // 判断组件是否存在于当前队列
    if(!renderQueue.some( item => item === component )){
        // 证明是第一次添加
        renderQueue.push(component)
    }
}

// 一段时间后调用
function flush(){
    // 遍历状态
    let item, component;
    while(item = setStateQueue.shift()){ //把第一个元素从数组里删除，并把第一个元素赋值给item
        const {stateChange, component} = item // stateChange可能是对象也可能是传过来一个函数
       
        // 函数的话要保存之前的状态
        if(!component.prevState){
            component.prevState = Object.assign({}, component.state)
        }

        if(typeof stateChange === 'function'){
            // 是一个函数
            Object.assign(component.state, stateChange(component.prevState, component.props)); // stateChange()调用函数，让它return值，再把值合并
        }else{
            // 是一个对象
            Object.assign(component.state, stateChange)
        }

        component.prevState = component.state
    }

    // 遍历组件
    while(component = renderQueue.shift()){
        renderComponent(component)
    }
}