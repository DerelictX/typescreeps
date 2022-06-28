
interface TransportTask{
    source:         Id<AnyStoreStructure|Tombstone|Ruin>    //从哪里来
    target:         Id<AnyCreep|AnyStoreStructure>          //到哪里去
    resourceType:   ResourceConstant    //让我康康里面装的啥
    amount:         number
}

interface TransferTask {
    target:         Id<AnyCreep|AnyStoreStructure>
    resourceType:   ResourceConstant
    amount:         number
}

interface WithdrawTask {
    target:         Id<AnyStoreStructure|Tombstone|Ruin>
    resourceType:   ResourceConstant
    amount:         number
}