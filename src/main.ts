
import { lab_run } from "./structure/lab";
import { tower_run } from "./structure/tower";
import { death_detect } from "./creep/death_detect";
import { spawn_run } from "./structure/spawn";
import { carrier_run } from "./creep/carrier/carrier";
import { generalist_run } from "./creep/generalist/generalist";
import { specialist_run } from "./creep/specialist/specialist";
import { fighter_run } from "./creep/fighter/fighter";
import { power_spawn_run } from "./structure/power_spawn";
import { structure_updater } from "./room/structure.updater";
import { operator_run } from "./power_creep/operator";
import { terminal_run } from "./structure/terminal";
import { spawn_loop } from "./room/spawn_loop";
import { body_generator } from "./creep/body_config";
import { memory_inspector } from "./room/task.performer";
import { link_run } from "./structure/link";

export const loop = function () {

    if(false){
        structure_updater
        body_generator
    }
    if(!Memory.owned_rooms){
        Memory.owned_rooms = []
        return
    }
    
    for(let room_name of Memory.owned_rooms){
        const room = Game.rooms[room_name];
        if(!room)continue
        try{
            if(!room.memory.structures)
                memory_inspector.structures(room)
            if(!room.memory.spawn_loop)
                memory_inspector.spawn_loop(room)
            if(!room.memory.tasks)
                memory_inspector.tasks(room)
            spawn_loop(room)
            spawn_run(room)
            tower_run(room)
            link_run(room)
            lab_run(room)
            power_spawn_run(room)
        }catch(error){
            console.log(room.name +':' + error);
        }
    }

    for(var name in Game.creeps) {
        if(Game.cpu.getUsed() > 18 && Game.cpu.bucket < 8000)
            break
        try{
            const creep = Game.creeps[name];
            if(creep.spawning)
                continue
            switch (creep.memory.class_memory.class) {
                case 'specialist':
                    specialist_run(creep)
                    break;
                case 'generalist':
                    generalist_run(creep)
                    break;
                case 'carrier':
                    carrier_run(creep)
                    break;
                case 'fighter':
                    fighter_run(creep)
                    break;
                default:
                    break;
            }
        }catch(error){
            console.log(name + ':' + error + '');
        }
    }

    for(var name in Game.powerCreeps){
        try{
            const powerCreep = Game.powerCreeps[name]
            if(!powerCreep.shard)
                continue
            switch(powerCreep.className) {
                case 'operator':
                    operator_run(powerCreep);
                    break;
            }

        }catch(error){
            console.log(name + ':' + error);
        }
    }
    
    try{
        death_detect()
        terminal_run()
        if(Game.shard.name == 'shard2')
            Game.cpu.generatePixel();
    }catch(error){
        console.log(':' + error);
    }

}
