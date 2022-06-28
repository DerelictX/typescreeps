import { gofor_boost } from "../fighter/fighter"
import { find_consume, find_obtain } from "./task.finder"
import { task_performers } from "./task.performer"

//generalist：只涉及到取能量，送能量，获取能量的职业
//任务的优先级在./task.finder.ts里面
export const generalist_run = function(creep:Creep) {
    if(creep.memory.class_memory.class != 'generalist')
        return
    if(creep.memory.boost_queue.length){
        //先去强化
        gofor_boost(creep)
        return
    }
    //获取能量或者消耗能量
    if(creep.memory.class_memory.state == 'obtain'){
        perform_obtain(creep)
    }else if(creep.memory.class_memory.state == 'consume'){
        perform_consume(creep)
    }
}

//获取能量
const perform_obtain = function(creep:Creep) {
    if(creep.memory.class_memory.class != 'generalist')
        return
    
    if(creep.room.name != creep.memory.resource_room){
        //先走到房间再说
        creep.moveTo(new RoomPosition(25,25,creep.memory.resource_room),{reusePath:100})
        return
    }

    if(creep.store.getFreeCapacity() == 0){
        //背包满了去消耗资源
        delete creep.memory.class_memory.obtain
        creep.memory.class_memory.state = 'consume'
        return
    }

    var ret_val:TaskReturnCode = 'idle'
    var task:ObtainTask|null|undefined = creep.memory.class_memory.obtain
    if(task){
        const action = task.action
        //执行任务
        switch (action) {
            case "harvest":
                ret_val = task_performers[action](creep,task)
                break
            case "withdraw":
                ret_val = task_performers[action](creep,task)
                break
        }
    }

    switch (ret_val) {
        case 'doing':
            //执行中
            return
        case 'idle':
        case 'error':
        case 'done_one':
            //完成一个任务
            delete creep.memory.class_memory.obtain
            break
        case 'done_all':
            //取完能量，去消耗
            delete creep.memory.class_memory.obtain
            creep.memory.class_memory.state = 'consume'
            return
    }

    //任务执行完毕或失败，获取下一个任务
    task = find_obtain(creep)
    if(task){
        const action = task.action
        //执行新取到的任务
        creep.memory.class_memory.obtain = task
        switch (action) {
            case "harvest":
                task_performers[action](creep,task)
                break
            case "withdraw":
                task_performers[action](creep,task)
                break
        }
    }

}

//消耗能量
const perform_consume = function(creep:Creep) {
    if(creep.memory.class_memory.class != 'generalist')
        return
    
    if(creep.room.name != creep.memory.target_room){
        creep.moveTo(new RoomPosition(25,25,creep.memory.target_room),{reusePath:100})
        return
    }
    
    //carry空了，去获取能量
    if(creep.store.getUsedCapacity() == 0){
        delete creep.memory.class_memory.consume
        creep.memory.class_memory.state = 'obtain'
        return
    }

    var ret_val:TaskReturnCode = 'idle'
    var task:ConsumeTask|null|undefined = creep.memory.class_memory.consume
    if(task){
        //执行任务
        const action = task.action
        switch (action) {
            case 'build':
                ret_val = task_performers[action](creep,task)
                break
            case 'repair':
                ret_val = task_performers[action](creep,task)
                break
            case 'transfer':
                ret_val = task_performers[action](creep,task)
                break
            case 'upgrade':
                ret_val = task_performers[action](creep,task)
                break
        }
        
    }

    switch (ret_val) {
        case 'doing':
            return
        case 'idle':
        case 'error':
        case 'done_one':
            //完成一个任务
            delete creep.memory.class_memory.consume
            break
        case 'done_all':
            //能量耗完了，取能量
            delete creep.memory.class_memory.consume
            creep.memory.class_memory.state = 'obtain'
            return
    }
    
    //没有任务，找任务
    task = find_consume(creep)
    if(task){
        //执行新的任务
        const action = task.action
        creep.memory.class_memory.consume = task
        switch (action) {
            case 'build':
                ret_val = task_performers[action](creep,task)
                break
            case 'repair':
                ret_val = task_performers[action](creep,task)
                break
            case 'upgrade':
                ret_val = task_performers[action](creep,task)
                break
        }
    }

}