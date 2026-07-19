import { join } from "path"
import { parse } from "json5"
import { unpack } from "msgpackr"
import { log, LogLevel } from "./loggingInterop"
import { asyncGuard } from "./databaseHandler"
import { H3_EPIC_ENTITLEMENTS } from "./platformEntitlements"
import { MissionManifest } from "./types/types"

const MODNAME = "EasyMod"

const DefaultEnabledDLCs = [
    "ed55aa5edc5941de92fd7f64de415793", // H3
    ...H3_EPIC_ENTITLEMENTS,

    "1659040", // HITMAN World of Assassination
    "1829580", // HITMAN 3 - Seven Deadly Sins Act 1: Greed
    "1829581", // HITMAN 3 - Seven Deadly Sins Act 2: Pride
    "1829582", // HITMAN 3 - Seven Deadly Sins Act 3: Sloth
    "1829583", // HITMAN 3 - Seven Deadly Sins Act 4: Lust
    "1829584", // HITMAN 3 - Seven Deadly Sins Act 5: Gluttony
    "1829585", // HITMAN 3 - Seven Deadly Sins Act 6: Envy
    "1829586", // HITMAN 3 - Seven Deadly Sins Act 7: Wrath
    "1829587", // HITMAN 3 - Seven Deadly Sins Collection
    "1829590", // HITMAN 3 Access Pass: HITMAN 2 Expansion
    "1829591", // HITMAN 3 - Deluxe Pack
    "1829592", // HITMAN 3 Access Pass: HITMAN 2 Standard
    "1829593", // HITMAN 3 Access Pass: HITMAN 1 Complete First Season
    "1829594", // HITMAN WOA - VR Access
    "1829595", // HITMAN 3 Access Pass: HITMAN 1 GOTY Upgrade
    "1829596", // HITMAN WOA - Trinity Pack
    "1829600", // HITMAN 3 - Carpathian Mountains
    "1829601", // HITMAN 3 - Mendoza
    "1829602", // HITMAN 3 - Chongqing
    "1829603", // HITMAN 3 - Berlin
    "1829604", // HITMAN 3 - Dartmoor
    "1829605", // HITMAN 3 - Dubai
    "1843460", // HITMAN 3 Access Pass: HITMAN 1 GOTY Edition
    "2184790", // HITMAN WOA - Street Art Pack
    "2184791", // HITMAN WOA - Makeshift Pack
    "2475260", // HITMAN WOA - Sarajevo Six Campaign Pack
    "2828470", // HITMAN WOA - The Undying Pack
    "2973650", // HITMAN 3 - The Disruptor Pack
    "3110360", // HITMAN WOA - The Drop Pack
    "3254350", // HITMAN WOA - The Splitter Pack
    "3711140", // HITMAN WOA - The Banker Pack
    "3957470", // HITMAN WOA - The Bruce Lee Pack
    "4097630", // HITMAN WOA - The Eminem vs. Slim Shady Pack
    "4328240", // HITMAN WOA - Patient Zero Requiem Pack
    "4542910", // HITMAN WOA - World Champions Pack
    "4621250", // HITMAN WOA - The Wizard Pack
    "4911210", // HITMAN WOA - The Herbalist Pack
    "4944070", // HITMAN WOA - The Getaway Pack
]

interface ModConfig {
    EnabledDLCs?: string[]
    DisabledItems?: string[]
}

class EasyMod {
    CONFIG: ModConfig
    CONTRACTS: MissionManifest[]
    STEAM_NAMESPACE_DEMO = "1847520"
    CFGPATH = join(MODNAME, "config.jsonc")
    OFCPATH = join(MODNAME, "contracts.prp")

    constructor() {
        this.CONFIG = Object()
        this.CONTRACTS = Array<MissionManifest>()
    }

    async Init() {
        const fs = asyncGuard.getFs()
        for (const dir of [MODNAME]) {
            if (await fs.exists(dir)) continue
            await fs.mkdir(dir, { recursive: true })
        }
        this.Reload(true)
    }

    async Reload(init = false) {
        const fs = asyncGuard.getFs()
        if (await fs.exists(this.CFGPATH)) {
            const data = await fs.readFile(this.CFGPATH, "utf-8")
            const config = parse(data) as ModConfig
            this.CONFIG.EnabledDLCs = config?.EnabledDLCs ?? []
            this.CONFIG.DisabledItems = config?.DisabledItems ?? []
            log(LogLevel.INFO, `Loaded config.jsonc file.`, MODNAME)
        }
    }

    async GetContracts(): Promise<MissionManifest[]> {
        const fs = asyncGuard.getFs()
        if (await fs.exists(this.OFCPATH)) {
            const data = await fs.readFile(this.OFCPATH)
            this.CONTRACTS = unpack(data) as MissionManifest[]
            log(LogLevel.INFO, `Loaded contracts.prp file.`, MODNAME)
        }
        return this.CONTRACTS ?? []
    }

    get H3_EPIC_ENTITLEMENTS(): string[] {
        let data = this.CONFIG.EnabledDLCs
        if (!data?.length) {
            data = DefaultEnabledDLCs
        }
        return data.filter(elm => elm.length == 32)
    }

    get H3_STEAM_ENTITLEMENTS(): string[] {
        let data = this.CONFIG.EnabledDLCs
        if (!data?.length) {
            data = DefaultEnabledDLCs
        }
        return data.filter(elm => elm.length != 32)
    }

    get DISABLED_UNLOCKABLES(): string[] {
        return this.CONFIG.DisabledItems ?? []
    }

    get FEATURED_CONTRACTS(): string[] {
        return this.CONTRACTS?.flatMap(elm => elm.Metadata?.Id) ?? []
    }
}

export const modInst = new EasyMod()
export const STEAM_NAMESPACE_DEMO = modInst.STEAM_NAMESPACE_DEMO
