// 我们可以把当前的watcher 放到一个全局变量上
let id = 0;
class Dep{
    constructor(){
        this.id = id++;
        this.subs = []; // 属性要记住watcher
    }
    depend(){
        // 让watcher 记住dep dep.depend()执行，this是每一个属性对应的dep实例
        Dep.target.addDep(this);  
    }
    addSub(watcher){ // 存储watcher
        this.subs.push(watcher)
    }
    notify(){
        this.subs.forEach(watcher => watcher.update());
    }
}
Dep.target = null;//类的静态属性
export function pushTarget(watcher){
    Dep.target = watcher;
}
export function popTarget(){
    Dep.target = null;
}


export default Dep;