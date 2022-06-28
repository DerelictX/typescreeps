type AnyClassMemory = CarrierMemory|FighterMemory|GeneralistMemory|SpecialistMemory

interface CreepMemory {
    class_memory:   AnyClassMemory  //职业专属内容
    spawn_room:     string  //出生地
    resource_room:  string  //获取资源房
    target_room:    string  //消耗资源房
    boost_queue:    {       //强化列表
        part:BodyPartConstant
        boost:MineralBoostConstant}[]
    
    _move?:{
        dest: {x:number,y:number,room:string},
        time: number,
        path: string,
        room: string
    }
}

type AnyRoleName = GeneralistRoleName|SpecialistRoleName|CarrierRoleName|FighterRoleName

//-------------------------------------------CARRIER-------------------------------------------//

type CarrierRoleName = 'collector'|'supplier'|'emergency'
type TransportState = 'collect'|'supply'

interface CarrierMemory {
    class:  'carrier'
    role:   CarrierRoleName

    state:      TransportState  //取货还是送货
    collect:    TransportTask[]
    supply:     TransportTask[]
}

//-------------------------------------------FIGHTER-------------------------------------------//

type FighterRoleName = 'melee'|'ranged'|'healer'

interface FighterMemory {   //没写打架
    class:  'fighter'
    role:   FighterRoleName
}

//-------------------------------------------WORKER--------------------------------------------//

type GeneralistRoleName = 'builder'|'maintainer'|'fortifier'|'pioneer'
type GeneralistState = 'obtain'|'consume'
interface GeneralistMemory {
    class:  'generalist'
    role:   GeneralistRoleName

    state:      GeneralistState //取能还是耗能
    obtain?:     ObtainTask
    consume?:    ConsumeTask
}

type SpecialistRoleName = 'upgrader_s'
    |'harvester_s0'|'harvester_s1'|'harvester_m'
    |'reserver'
interface SpecialistMemory {
    class:  'specialist'
    role:   SpecialistRoleName
}