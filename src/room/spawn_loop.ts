import { body_generator, default_body_config } from "@/creep/body_config"
import { change_reaction } from "@/structure/lab"
import { structure_updater } from "./structure.updater"
import { harvest_updater } from "./task.performer"

//计时器到点后，判断到底要不要生这个爬，更新爬的配置
//循环器顺便也用于扫描房间
const spawn_handler: {[r in AnyRoleName]:(room:Room) => boolean} = {
    harvester_m: function(room:Room){
        harvest_updater.mineral(room)
        const generator = body_generator.W2cM
        room.memory.spawn_loop['harvester_m'].body_parts = generator(
            room.energyAvailable,7)
        if(room.memory.tasks.harvest_m[0])  //你挖个啥？
            return true
        return false
    },
    harvester_s0: function(room:Room){
        harvest_updater.source(room)
        if(!room.memory.tasks.harvest[0])
            return false

        const generator = body_generator.W2cM
        let workload = 3
        if(room.controller && room.controller.level == 8)
            workload = 5       //shard3生大点的爬，省cpu
        room.memory.spawn_loop['harvester_s0'].body_parts = generator(
            room.energyAvailable,workload)
        return true
    },
    harvester_s1: function(room:Room){
        harvest_updater.source(room)
        if(!room.memory.tasks.harvest[1])
            return false

        const generator = body_generator.W2cM
        let workload = 3
        if(room.controller && room.controller.level == 8)
            workload = 5
        room.memory.spawn_loop['harvester_s1'].body_parts = generator(
            room.energyAvailable,workload)
        return true
    },

    maintainer: function(room:Room){
        structure_updater.towers(room)  //顺便更新建筑缓存
        const generator = body_generator.WCM
        let workload = 4
        room.memory.spawn_loop['maintainer'].body_parts = generator(
            room.energyAvailable,workload)
        return true
    },
    supplier: function(room:Room){
        structure_updater.labs(room)  //顺便更新建筑缓存
        change_reaction(room)         //更新lab任务

        let workload = room.controller?.level
        if(!workload) return false
        room.memory.spawn_loop['supplier'].body_parts = body_generator.C2M(
            room.energyAvailable,workload)
        return true
    },
    collector: function(room:Room){
        structure_updater.containers(room)  //顺便更新建筑缓存
        structure_updater.links(room)

        let workload = room.controller?.level
        if(!workload) return false
        room.memory.spawn_loop['collector'].body_parts = body_generator.C2M(
            room.energyAvailable,workload)
        return true
    },

    upgrader_s: function(room:Room){
        harvest_updater.upgrade(room)
        const generator = body_generator.W2cM
        let workload = 5
        room.memory.spawn_loop['upgrader_s'].body_parts = generator(
            room.energyAvailable,workload)
            
        if(room.storage && room.storage.my && room.storage.store['energy'] < 240000)
            return false
        if(room.memory.tasks.upgrade[0])
            return true
        return false
    },
    builder: function(room:Room){
        const generator = body_generator.WCM
        let workload = 4
        room.memory.spawn_loop['builder'].body_parts = generator(
            room.energyAvailable,workload)
        if(room.find(FIND_MY_CONSTRUCTION_SITES)[0])
            return true
        return false
    },
    fortifier: function(room:Room){
        room.memory.spawn_loop['fortifier'].succ_interval = 1500
        const generator = body_generator.WCM
        let workload = 16
        room.memory.spawn_loop['fortifier'].body_parts = generator(
            room.energyAvailable,workload)
        if(room.storage && room.storage.store['energy'] > 270000)   //能量多了再刷墙
            return true
        return false
    },

    healer: (room:Room) => false,
    melee: (room:Room) => false,
    ranged: (room:Room) => false,
    emergency: (room:Room) => false,
    pioneer: (room:Room) => false,
    reserver: function(room:Room){
        return false
        room.memory.spawn_loop['reserver'].succ_interval = 1100
        if(room.name == 'E33S57') return true        //手动设置
        return false
    },
}


export const spawn_loop = function(room: Room) {
    var role_name: AnyRoleName
    for(role_name in room.memory.spawn_loop){
        const spawn_loop = room.memory.spawn_loop[role_name]
        
        if(spawn_loop.succeed_time > Game.time)
            continue
        room.memory.spawn_loop[role_name].succeed_time = Game.time + 1500   //默认1500tick后再生下一个
        if(room.memory.spawn_loop[role_name].succ_interval < 300)
            room.memory.spawn_loop[role_name].succ_interval = 300

        if(spawn_handler[role_name](room))
            room.memory.spawn_loop[role_name].queued = 1    //确定要生
            
        if(room.memory.spawn_loop[role_name].body_parts.length == 0){
            const generator = body_generator[default_body_config[role_name].generator]
            let workload = default_body_config[role_name].workload
            room.memory.spawn_loop[role_name].body_parts = generator(
                room.energyAvailable,workload)
        }
        room.memory.spawn_loop[role_name].boost_queue = []
    }
}