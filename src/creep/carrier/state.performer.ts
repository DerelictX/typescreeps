import { find_store, find_transport } from "./task.finder"
import { _collect, _supply } from "./task.performer"

//取货
export const perform_collect = function(creep:Creep) {
    if(creep.memory.class_memory.class != 'carrier')
        return
    
    if(creep.room.name != creep.memory.resource_room){
        //先走到获取资源的房间
        creep.moveTo(new RoomPosition(25,25,creep.memory.resource_room))
        return
    }
    
    var ret_val:TaskReturnCode = 'idle'
    var task:TransportTask|null|undefined = creep.memory.class_memory.collect[0]
    if(task){
        //执行取货任务
        ret_val = _collect(creep,task)
    }
        
    switch (ret_val) {
        case 'doing':
            return
        case 'idle':    //货取完了
            //去送货
            if(creep.memory.class_memory.supply[0]){
                creep.memory.class_memory.state = 'supply'
                return
            }
            //把因为某些原因残留的资源送回storage
            if(creep.store.getUsedCapacity() > 0){
                find_store(creep)
                return
            }
            //找任务
            find_transport(creep)
            return

        case 'error':
            //任务执行失败，那咋办嘛，不管咯
            creep.memory.class_memory.collect.shift()
            return
        case 'done_one':
            //取到一个货物，等会再送，先看看还有没有要取的货
            creep.memory.class_memory.supply.push(task)
            creep.memory.class_memory.collect.shift()
            if(!creep.memory.class_memory.collect[0]){
                //没有货要取，送货去
                creep.memory.class_memory.state = 'supply'
            }
            return
        case 'done_all':
            //怎么会是呢
            creep.say('???')
            return
    }
}

//送货，和取货类似
export const perform_supply = function(creep:Creep) {
    if(creep.memory.class_memory.class != 'carrier')
        return
    
    if(creep.room.name != creep.memory.target_room){
        creep.moveTo(new RoomPosition(25,25,creep.memory.target_room))
        return
    }
    var ret_val:TaskReturnCode = 'idle'
    var task:TransportTask|null|undefined = creep.memory.class_memory.supply[0]
    if(task){
        ret_val = _supply(creep,task)
    }

    switch (ret_val) {
        case 'doing':
            return
        case 'idle':
            creep.memory.class_memory.state = 'collect'
            return

        case 'error':
        case 'done_one':
            creep.memory.class_memory.supply.shift()
            if(!creep.memory.class_memory.supply[0]){
                creep.memory.class_memory.state = 'collect'
            }
            return
        case 'done_all':
            creep.say('???')
            return
    }
}
