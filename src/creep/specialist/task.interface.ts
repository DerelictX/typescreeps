interface StaticHarvestTask extends StaticTransportTask {
    target:         Id<Source|Mineral>
}

interface StaticUpgradeTask extends StaticTransportTask {
    target: Id<StructureController>
    energy_structs: Id<AnyStoreStructure>[]
}

interface StaticTransportTask {
    structs_from:   Id<AnyStoreStructure>[]
    structs_to:     Id<AnyStoreStructure>[]
}