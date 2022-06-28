//接任务：获取能量的任务
export const find_obtain = function(creep:Creep) {
    if(creep.memory.class_memory.class != 'generalist')
        return
    const role: GeneralistRoleName = creep.memory.class_memory.role
    var priority: ObtainPriority
    var duty: ObtainTask|null

    //根据每个角色的任务优先级，找各个种类的任务
    priority = obtain[role]
    for(let i in priority){
        duty = obtain_finders[priority[i]](creep)
        if(duty){
            //creep.say(':'+ priority[i])
            //找到任务就返回
            return duty
        }
    }
}
//接任务：消耗能量的任务
export const find_consume = function(creep:Creep) {
    if(creep.memory.class_memory.class != 'generalist')
        return
    const role:GeneralistRoleName = creep.memory.class_memory.role
    var priority: ConsumePriority
    var duty: ConsumeTask|null

    //根据每个角色的任务优先级，找各个种类的任务
    priority = consume[role]
    for(let i in priority){
        duty = consume_finders[priority[i]](creep)
        if(duty){
            //creep.say(':'+ priority[i])
            //找到任务就返回
            return duty
        }
    }
}

//取能任务优先级
type ObtainPriority = {[i:number]:keyof typeof obtain_finders}
const obtain: {[role in GeneralistRoleName]:ObtainPriority} = { //autarky:自助
    builder:    ['withdraw_energy','harvest_autarky'],  //先从container和storage取，没有自己去挖
    maintainer: ['withdraw_energy'],
    fortifier:  ['unstore_energy'],                     //只从storage取
    pioneer:    ['loot_energy','withdraw_energy','harvest_autarky'],    //优先从遗迹拿
        //loot:掠夺
}

//耗能任务优先级
type ConsumePriority = {[i:number]:keyof typeof consume_finders}
const consume: {[role in GeneralistRoleName]:ConsumePriority} = {
    //repair_damaged：先修被锤的建筑
    builder: [      //build:    造建筑，业余修墙升级
        'repair_damaged','build',
        'fortify','upgrade_autarky','over_fortify'
    ],
    maintainer: [   //填ext,    修路,   维持墙的血量不下降,   没事去升级
        'repair_damaged','fill_extensions','repair_decayed',
        'fortify','upgrade_autarky','over_fortify'
    ],
    fortifier:  [
        'repair_damaged','build',
        'fortify','over_fortify'    //增加墙的血量
    ],
    pioneer: [
        'fill_extensions','repair_damaged','build',     //开新房时，填ext，造建筑
        'upgrade_autarky','fortify','over_fortify'
    ]
}



const obtain_finders = {
    //从container和storage取能
    withdraw_energy: function(creep: Creep): WithdrawEnergyTask|null{
        let target: AnyStoreStructure|null = creep.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => {
                if(structure.structureType == STRUCTURE_CONTAINER)
                    return structure.store['energy'] >= 800
                if(structure.structureType == STRUCTURE_STORAGE
                    || structure.structureType == STRUCTURE_TERMINAL)
                    return structure.store['energy'] >= 10000
                return false
            }
        })
        if(target)
            return {action:"withdraw", target:target.id}
        return null
    },

    //没有专门harvester的时候,自己去挖source
    harvest_autarky: function(creep: Creep): HarvestTask|null{
        let target = creep.pos.findClosestByRange(FIND_SOURCES, {
            filter: (source) => {
                return source.energy==source.energyCapacity
                    || source.energy > source.ticksToRegeneration*10
            }
        })
        if(target)
            return {action:"harvest", target:target.id}
        return null
    },

    //只从有一定能量储备的storage取，避免能量见底
    unstore_energy: function(creep: Creep): WithdrawEnergyTask|null{
        let target:StructureStorage|StructureTerminal|undefined = creep.room.storage
        if(target && target.store['energy'] > 200000){
            return {action:"withdraw", target:target.id}
        }
        target = creep.room.terminal
        if(target && target.store['energy'] > 100000){
            return {action:"withdraw", target:target.id}
        }
        return null
    },

    //从遗迹取能量
    loot_energy: function(creep: Creep): WithdrawEnergyTask|null{
        let target: AnyOwnedStructure&AnyStoreStructure|null = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {
            filter: (structure) => {
                if(structure.structureType == STRUCTURE_STORAGE
                    || structure.structureType == STRUCTURE_TERMINAL
                    || structure.structureType == STRUCTURE_SPAWN
                    || structure.structureType == STRUCTURE_EXTENSION
                    || structure.structureType == STRUCTURE_TOWER
                    || structure.structureType == STRUCTURE_LAB
                    || structure.structureType == STRUCTURE_LINK)
                    return structure.store['energy'] > 0
                return false
            }
        })
        if(target)
            return {action:"withdraw", target:target.id}
        return null
    },
}

const consume_finders = {
    //升级，能量自己想办法，不和专门的upgrader抢link的能量
    upgrade_autarky: function(creep: Creep): UpgradeTask|null{
        let target = creep.room.controller;
        if(target && (target.level<=7 || target.ticksToDowngrade<=190000))
            return {action:"upgrade", target:target.id}
        return null
    },
    
    //填ext
    fill_extensions :function(creep:Creep): TransferEnergyTask|null {
        if(creep.room.energyAvailable == creep.room.energyCapacityAvailable)
            return null
        let target: AnyOwnedStructure&AnyStoreStructure|null = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
            filter: (structure) => {
                if(structure.structureType == STRUCTURE_SPAWN
                    || structure.structureType == STRUCTURE_EXTENSION)
                    return structure.store.getFreeCapacity('energy') > 0
                if(structure.structureType == STRUCTURE_TOWER)
                    return structure.store.getFreeCapacity('energy') >= 300
                return false
            }
        })
        if(target)
            return {action:'transfer', target:target.id}
        return null
    },

    //。。。。
    build: function(creep:Creep): BuildTask|null{
        let target = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES)
        if(target)
            return {action:"build", target:target.id}
        return null
    },

    //被锤的建筑
    repair_damaged: function(creep: Creep): RepairTask|null{
        let target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => {
                if(structure.structureType == STRUCTURE_RAMPART
                    || structure.structureType == STRUCTURE_WALL)
                    return structure.hits < 10000
                if(structure.structureType == STRUCTURE_CONTAINER
                    || structure.structureType == STRUCTURE_ROAD)
                    return structure.hits < structure.hitsMax/2
                return structure.hits < structure.hitsMax
            }
        })
        if(target)
            return {action:"repair", target:target.id}
        return null
    },

    //老化的路和container
    repair_decayed: function(creep:Creep): RepairTask|null{
        let target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => {
                if(structure.structureType == STRUCTURE_ROAD)
                    return structure.hits < structure.hitsMax - 1500
                if(structure.structureType == STRUCTURE_CONTAINER)
                    return structure.hits < 200000
                return false
            }
        })
        if(target)
            return {action:"repair", target:target.id}
        return null
    },

    //维持墙的血量在room.memory.structures.wall_hits左右
    fortify: function(creep:Creep): RepairTask|null{
        var wallHits = creep.room.memory.structures.wall_hits - 1000
        if(wallHits >= 100000)
            creep.room.memory.structures.wall_hits = wallHits

        let target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => {
                if(structure.structureType == STRUCTURE_RAMPART
                    || structure.structureType == STRUCTURE_WALL)
                    return structure.hits < wallHits        //只修血量小于阈值的墙
                return false
            }
        })
        if(target)
            return {action:"repair", target:target.id}
        return null
    },

    //刷墙，优先级低于fortify，进入该函数说明没有低于阈值的墙了，要增加阈值
    over_fortify: function(creep:Creep): RepairTask|null{
        var wallHits = creep.room.memory.structures.wall_hits + 30000   //增加阈值
        if(wallHits <= 100000000)
            creep.room.memory.structures.wall_hits = wallHits

        let target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => {
                if(structure.structureType == STRUCTURE_RAMPART
                    || structure.structureType == STRUCTURE_WALL)
                    return structure.hits < wallHits
                return false
            }
        })
        if(target)
            return {action:"repair", target:target.id}
        return null
    },

}