import Component from '../react/component';

function createElement(tag,attrs,...childrens) {
    // console.log(tag)
    // console.log(attrs)
    // console.log(childrens)
    attrs = attrs || {}
    return {
        tag, // 外层标签
        attrs, // 属性  一个对象
        childrens, // 子节点 数组
        key: attrs.key || null  // 用来做真实节点和虚拟节点的查找关系，但虚拟节点去查找以有节点，可以通过这个key来进行标识，就能准确定位到跟谁对比
    }
}


export default {
    createElement,
    Component
}