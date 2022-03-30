import { body_generator, default_body_config } from "@/creep/body_config"
import { change_reaction } from "@/structure/lab"
import { structure_updater } from "./structure.updater"
import { harvest_updater } from "./task.performer"

export const spawn_loop = function(room: Room) {
    var role_name: AnyRoleName
    for(role_name in room.memory.spawn_loop){
        const spawn_loop = room.memory.spawn_loop[role_name]
        
        if(spawn_loop.succeed_time > Game.time)
            continue
        room.memory.spawn_loop[role_name].succeed_time = Game.time + 1500
        if(room.memory.spawn_loop[role_name].succ_interval < 300)
            room.memory.spawn_loop[role_name].succ_interval = 300
        
        const generator = body_generator[default_body_config[role_name].generator]
        let workload = default_body_config[role_name].workload
        room.memory.spawn_loop[role_name].body_parts = generator(
            room.energyAvailable,workload)

        switch(role_name){
            
        case 'harvester_m':
            harvest_updater.mineral(room)
            if(room.memory.tasks.harvest_m[0])
                room.memory.spawn_loop[role_name].queued = 1
            break;
        case 'harvester_s0':
            harvest_updater.source(room)
            if(room.memory.tasks.harvest[0])
                room.memory.spawn_loop[role_name].queued = 1
            break;
        case 'harvester_s1':
            harvest_updater.source(room)
            if(room.memory.tasks.harvest[1])
                room.memory.spawn_loop[role_name].queued = 1
            break;
        
        case 'pioneer':
            if(room.storage && room.storage.my)
                break
            room.memory.spawn_loop[role_name].succ_interval = 600
            room.memory.spawn_loop[role_name].queued = 1
            break;
        case 'maintainer':
            structure_updater.towers(room)
            room.memory.spawn_loop[role_name].queued = 1
            break;
            
        case 'supplier':
            structure_updater.labs(room)
            change_reaction(room)
            if(room.storage && room.storage.my)
                room.memory.spawn_loop[role_name].queued = 1
            break;
        case 'collector':
            structure_updater.containers(room)
            structure_updater.links(room)
            if(room.storage && room.storage.my)
                room.memory.spawn_loop[role_name].queued = 1
            break;

        case 'upgrader_s':
            harvest_updater.upgrade(room)
            if(room.storage && room.storage.store['energy'] > 300000){
                if(room.controller && room.controller.level < 8)
                    room.memory.spawn_loop['upgrader_s'].queued = 1
                else room.memory.spawn_loop['fortifier'].queued = 1
                room.memory.spawn_loop[role_name].succ_interval = 750
            }
            break;

        default:
            break;
        }
        break
    }
}