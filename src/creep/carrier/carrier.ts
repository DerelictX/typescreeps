import { perform_collect, perform_supply } from "./state.performer"

export const carrier_run = function(creep: Creep){
    if(creep.memory.class_memory.class != 'carrier')
        return
    //取货和送货
    if(creep.memory.class_memory.state == 'collect'){
        perform_collect(creep)
    }else if(creep.memory.class_memory.state == 'supply'){
        perform_supply(creep)
    }

}