
interface TransportTask{
    source:         Id<AnyStoreStructure|Tombstone|Ruin>
    target:         Id<AnyCreep|AnyStoreStructure>
    resourceType:   ResourceConstant
    amount:         number
}