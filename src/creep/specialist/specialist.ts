import { gofor_boost } from "../fighter/fighter"

export const specialist_run = function(creep:Creep) {
    if(creep.memory.class_memory.class != 'specialist')
        return

    role_performers[creep.memory.class_memory.role](creep)
}

//一个任务干到死的爬，没有任务的切换，没有优先级
//角色的行为写死
const role_performers = {
    harvester_m(creep: Creep) {
        const task:StaticHarvestTask = creep.room.memory.tasks.harvest_m[0]
        if(!task) return
        const mineral = Game.getObjectById(task.target)
        const container = Game.getObjectById(task.structs_from[0])
        if(!mineral || !container) return
        
        if(!creep.pos.isEqualTo(container))     //先走到容器上面
            creep.moveTo(container)
        if(container.store.getFreeCapacity('energy') > 0)   //容器满了就不挖了
            creep.harvest(mineral)
    },
    harvester_s0(creep: Creep) {
        const task:StaticHarvestTask = creep.room.memory.tasks.harvest[0]
        if(!task) return
        const source = Game.getObjectById(task.target)
        const container = Game.getObjectById(task.structs_from[0])
        if(!source || !container) return
        
        if(!creep.pos.isEqualTo(container))     //先走到容器上面
            creep.moveTo(container)
        if(container.hits <= 225000)        //自己修老化的容器,不麻烦维护工
            creep.repair(container)
        if(creep.store.getFreeCapacity('energy') > 0
            || container.store.getFreeCapacity('energy') > 0)   //挖满容器和Carry
            creep.harvest(source)

        if(creep.store.getFreeCapacity('energy') > 0)
            return
        for(let id of task.structs_to){     //Carry满了以后，传能量给周围的link,还有spawn，tower啥的
            const struct = Game.getObjectById(id);
            if(struct && struct.store && struct.store.getFreeCapacity('energy') > 0){
                creep.transfer(struct,'energy')
                break
            }
        }
    },
    harvester_s1(creep: Creep) {    //同上，只是挖的source不一样
        const task:StaticHarvestTask = creep.room.memory.tasks.harvest[1]
        if(!task) return
        const source = Game.getObjectById(task.target)
        const container = Game.getObjectById(task.structs_from[0])
        if(!source || !container) return
        
        if(!creep.pos.isEqualTo(container))
            creep.moveTo(container)
        if(container.hits <= 225000)
            creep.repair(container)
        if(creep.store.getFreeCapacity('energy') > 0
            || container.store.getFreeCapacity('energy') > 0)
            creep.harvest(source)

        if(creep.store.getFreeCapacity('energy') > 0)
            return
        for(let id of task.structs_to){
            const struct = Game.getObjectById(id);
            if(struct && struct.store && struct.store.getFreeCapacity('energy') > 0){
                creep.transfer(struct,'energy')
                break
            }
        }
    },

    upgrader_s(creep:Creep) {   //升级爬
        if(creep.memory.boost_queue.length){
            gofor_boost(creep)
            return
        }

        const task:StaticUpgradeTask = creep.room.memory.tasks.upgrade[0]
        if(!task) return
        const controller = Game.getObjectById(task.target)
        if(!controller || !controller.my)
            return
        
        if(!creep.pos.inRangeTo(controller,3))
            creep.moveTo(controller)

        if(creep.store['energy'] <= 10){    //没能量哩，从周围的建筑取能量
            const struct = task.structs_from.map(id => Game.getObjectById(id))
                .find(s => s && s.store['energy'] > 0)
            if(struct){
                if(creep.withdraw(struct,'energy') == ERR_NOT_IN_RANGE)
                    creep.moveTo(struct)
            }
        }
    
        creep.upgradeController(controller);
    },

    reserver(creep:Creep){  //reserve
        const flag = Game.flags.claim
        if(!flag) return
        if(creep.pos.isEqualTo(flag)){
            const controller = creep.room.controller
            if(!controller) return
            if(controller.owner && !controller.my)
                creep.attackController(controller)
            else creep.reserveController(controller)
        } else {
            creep.moveTo(Game.flags.claim,{reusePath:100,visualizePathStyle:{}})
        }
    }
}