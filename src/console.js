/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('console');
 * mod.thing == 'a thing'; // true
 */

module.exports = {
    
    //update memory for new features
    
    scan_sources(room){
        room.memory.tasks.harvest = []
        const sources = room.find(FIND_SOURCES);
        for(let i in sources) {
            let target = sources[i]
            let container = target.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: { structureType: STRUCTURE_CONTAINER }
            });
            let link = target.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: { structureType: STRUCTURE_LINK }
            });
            let task = { action: "harvest", target: target.id };
            if (container && container.pos.isNearTo(target)) {
                task.container = container.id;
                if (link && link.pos.isNearTo(container)) {
                    task.link = link.id;
                }
            }
            else if (link && link.pos.inRangeTo(target, 2)) {
                task.link = link.id;
            }
            room.memory.tasks.harvest.push(task)
        }
    },

    scan_towers(room){
        
        room.memory.structures.towers = []
        const towers = room.find(FIND_MY_STRUCTURES,{
            filter: {structureType: STRUCTURE_TOWER}
        });
        for(let i in towers){
            room.memory.structures.towers.push(towers[i].id)
        }
    },

    clear_flags(){
        for(flag in Game.flags){
            Game.flags[flag].remove()
        }
    },

    clear_depricated(){
        for(room_name in Memory.rooms){
            room = Game.rooms[room_name]
            for(key in room.memory){
                if(key != 'spawn_queue' && key != 'role_balance' && key != 'structures')
                    delete room.memory[key]
            }
        }
    }
};