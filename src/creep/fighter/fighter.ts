export const fighter_run = function(creep:Creep) {
    if(creep.memory.class_memory.class != 'fighter')
        return

    role_performers[creep.memory.class_memory.role](creep)
}

const squad_runner = function(squad: Creep[]){
    const melee = squad[0]
    const healer = squad[1]
}

const role_performers = {
    healer(creep:Creep){
        
        const target = creep.pos.findClosestByRange(FIND_MY_CREEPS, {
            filter: function(object) {
                return object.name != creep.name
            }
        });
        if(target) {
            creep.moveTo(target);
            if(target.hits < target.hitsMax) {
                creep.heal(target);
            }
            else creep.heal(creep)
        }
        else {
            creep.heal(creep)
            creep.moveTo(Game.flags['he'])
        }
    },
    ranged(creep:Creep){

    },
    melee(creep:Creep){

//        creep.moveTo(Game.flags['at'],{reusePath:100})
        if(Game.flags['at'].room){
            const found = Game.flags.at.pos.lookFor(LOOK_STRUCTURES);
            if(found.length && found[0]) {
                if(creep.pos.isNearTo(found[0]))
                    creep.attack(found[0])
                else creep.moveTo(found[0])
                return
            }
        }
        
    },
}