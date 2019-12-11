// 1、对比最外层的标签2、对象子节点 3、对比标签上的属性
import {setAttribute, setComponentProps, createComponent} from './index'

export function diff(dom, vnode, container) {
    // console.log(vnode)
    // 真实dom和虚拟dom的对比
    const ret=diffNode(dom,vnode);
    // console.log(ret)
    if(container){
        container.appendChild(ret)
    }
    return ret
}

export function diffNode(dom, vnode) { //  diffNode就是function _render(),只是将虚拟dom转化为真实dom加到容器里
    // console.log(dom)
    let out = dom;
    if(vnode === undefined || vnode===null || typeof vnode === 'boolean') vnode = '';
    if(typeof vnode === 'number') vnode = String(vnode);
    // 如果是字符串
    if( typeof vnode  === 'string'){
       if(dom && dom.nodeType === 3){ // 如果dom存在就去更新内容
            if(dom.textContent !== vnode){
                // 更新文本内容
                dom.textContent = vnode
            }
        }else{ // 不存在，新建文本节点  把之前的节点进行替换
            out = document.createTextNode(vnode)
            if(dom && dom.parentNode){
                 // 现在的节点out 之前的节点dom
                 dom.parentNode.replaceNode(out, dom)
            }
        }
        return out
    }

    // 函数组件或类组件
    if(typeof vnode.tag === 'function'){
      return diffCoumponent(out, vnode);
    }

    //1、先对比tag
    // 非文本DOM节点 jsx对象 还是组件
    if(!dom){ // 如果没有创建元素节点
        out = document.createElement(vnode.tag)  
    }

    // 2、比较子节点（dom和组件）
    if(vnode.childrens && vnode.childrens.length>0||(out.childNodes && out.childNodes.length>0 )){
        // 对比组件 或者 子节点
        diffChildren(out, vnode.childrens) 
    } 

    diffAttribute(out, vnode);
    return out
}

function diffCoumponent(dom, vnode){
    let comp = dom;
    // <Home />组件改成<App />组件
    // 如果组件没有变化，重新设置props
    if(comp && comp.constructor === vnode.tag){
        // 重新设置props
        setComponentProps(comp, vnode.attrs)
        // 赋值
        dom = comp.base
    }else{
        // 组件类型发生变化 (把之前的组件移除原来的，添加新的)
        if(comp){
            // 卸载组件旧的组件
            unmountComonent(comp); 
            comp = null
        }
        // 1、创建新组件
        comp = createComponent(vnode.tag, vnode.attrs)
        // 2、设置组件属性
        setComponentProps(comp, vnode.attrs)
        // 3、给当前挂载base
        dom = comp.base
    }
    return dom
}

function unmountComonent(comp){
    removeNode(comp.base)
}

function removeNode(dom){
    if(dom && dom.parentNode){
        dom.parentNode.removeNode(dom)
    }
}

function diffChildren(dom,vchildren){ // 刚开始dom为空值
    const domChildren = dom.childNodes;
    const children = [];
    const keyed = {};
    // 将有key的节点（用对象保存）和没有key的节点（用数组保存）分开
    if (domChildren.length > 0) {
        for (let i = 0; i < domChildren.length; i++) {
            const child = domChildren[i];
            const key = child.key;
            if (key) {
                keyedLen++;
                keyed[key] = child;
            } else {
                children.push(child);
            }
        }
    }
    if (vchildren && vchildren.length > 0) {
        let min = 0;
        let childrenLen = children.length;
        for (let i = 0; i < vchildren.length; i++) {
            const vchild = vchildren[i];
            const key = vchild.key;
            let child;
            // 如果有key，找到对应key值的节点
            if (key) {
                if (keyed[key]) {
                    child = keyed[key];
                    keyed[key] = undefined;
                }
            } else if (min < childrenLen) { // 如果没有key，则优先找类型相同的节点
                for (let j = min; j < childrenLen; j++) {
                    let c = children[j];
                    if (c && isSameNodeType(c, vchild)) {
                        child = c;
                        children[j] = undefined;
                        if (j === childrenLen - 1) childrenLen--;
                        if (j === min) min++;
                        break;
                    }
                }

            }
            // 对比
            child = diffNode(child, vchild);
            // 更新DOM
            const f = domChildren[i];
            if (child && child !== dom && child !== f) {
                // 如果更新前的对应位置为空，说明此节点是新增的
                if (!f) {
                    dom.appendChild(child);
                } else if (child === f.nextSibling) {
                    // 如果更新后的节点和更新前对应位置的下一个节点一样，说明当前位置的节点被移除了
                    removeNode(f);
                } else {
                    // 将更新后的节点移动到正确的位置
                    dom.insertBefore(child, f);
                }
            }
        }
    }
}

function diffAttribute(dom,vnode) { // dom是原有的节点对象  vnode是虚拟dom
    // 保存之前的所有属性
    const oldAttrs ={};
    const newAttrs =vnode.attrs;
    const domAttrs = dom.attributes;
    // console.log(domAttrs,'adsda');
    
    [...domAttrs].forEach(item=>{
        oldAttrs[item.name]=item.value;
    });
    // 比较
    // 如果原来的属性跟新的属性对比，不在新的属性中，则将其移除掉(值设为undefined)
    for(let key in oldAttrs){
        if(!(key in newAttrs)){
            setAttribute(dom,key,undefined);
        }
    }
    // 更新  class='active' abc
    for(let key in newAttrs){
        if(oldAttrs[key]!==newAttrs[key]){
            // 值不同，更新值
            setAttribute(dom,key,newAttrs[key])
        }
    }
}


function isSameNodeType(dom, vnode) {
    if (typeof vnode === 'string' || typeof vnode === 'number') {
        return dom.nodeType === 3;
    }

    if (typeof vnode.tag === 'string') {
        return dom.nodeName.toLowerCase() === vnode.tag.toLowerCase();
    }

    return dom && dom._component && dom._component.constructor === vnode.tag;
}