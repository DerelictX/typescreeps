
export const death_detect = function(){
    //enqueue
    for(let creep_name in Memory.creeps) {  //死去的爬爬灵魂消散哩
        if(!Game.creeps[creep_name]) {
            try{
                delete Memory.creeps[creep_name];
                //console.log('Clearing non-existing creep memory:', name);
            }catch(error){
                delete Memory.creeps[creep_name];
                console.log(creep_name + ':' + error);
            }
        }
    }

    
    //visual
    for(var spawn_name in Game.spawns){     //猜猜我是谁
        var spawn = Game.spawns[spawn_name];
        
        if(spawn && spawn.spawning) {
            var spawningCreep = Game.creeps[spawn.spawning.name];
            spawn.room.visual.text(
                spawningCreep.memory.class_memory.role,
                spawn.pos.x, spawn.pos.y-1);
        }    
    }
}