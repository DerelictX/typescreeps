
type WorkAction = 
    ACTION_HARVEST|ACTION_UPGRADE
    |ACTION_BUILD|ACTION_REPAIR
    |ACTION_WITHDRAW|ACTION_TRANSFER

type ACTION_HARVEST = "harvest"
type ACTION_UPGRADE = "upgrade"
type ACTION_BUILD = "build"
type ACTION_REPAIR = "repair"
type ACTION_WITHDRAW = "withdraw"
type ACTION_TRANSFER = "transfer"

type ObtainTask =
    HarvestTask | WithdrawEnergyTask

type ConsumeTask = 
    UpgradeTask | TransferEnergyTask
    | BuildTask | RepairTask

interface HarvestTask{
    action: ACTION_HARVEST
    target: Id<Source|Mineral|Deposit>
}

interface UpgradeTask{
    action: ACTION_UPGRADE
    target: Id<StructureController>
}

interface BuildTask{
    action: ACTION_BUILD
    target: Id<ConstructionSite>
}

interface RepairTask{
    action: ACTION_REPAIR
    target: Id<Structure>
}

interface WithdrawEnergyTask{
    action: ACTION_WITHDRAW
    target: Id<AnyStoreStructure|Tombstone|Ruin>
}

interface TransferEnergyTask{
    action: ACTION_TRANSFER
    target: Id<AnyCreep|AnyStoreStructure>
}