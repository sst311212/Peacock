import { join } from "path"
import { parse } from "json5"
import { validateMission } from "./controller"
import { asyncGuard } from "./databaseHandler"
import { H3_EPIC_ENTITLEMENTS } from "./platformEntitlements"
import { MissionManifest } from "./types/types"

const MODNAME = "EasyMod"

const DefaultEnabledDLCs = [
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
    "1829594", // HITMAN 3 - VR Access
    "1829595", // HITMAN 3 Access Pass: HITMAN 1 GOTY Upgrade
    "1829596", // HITMAN 3 - Trinity Pack
    "1829600", // HITMAN 3 - Carpathian Mountains
    "1829601", // HITMAN 3 - Mendoza
    "1829602", // HITMAN 3 - Chongqing
    "1829603", // HITMAN 3 - Berlin
    "1829604", // HITMAN 3 - Dartmoor
    "1829605", // HITMAN 3 - Dubai
    "1843460", // HITMAN 3 Access Pass: HITMAN 1 GOTY Edition
    "2184790", // HITMAN 3 - Street Art Pack
    "2184791", // HITMAN 3 - Makeshift Pack
    "2475260", // HITMAN 3 - Sarajevo Six Campaign Pack
    "2828470", // HITMAN 3 - The Undying Pack
    "2973650", // HITMAN 3 - The Disruptor Pack
    "3110360", // HITMAN 3 - The Drop Pack
    "3254350", // HITMAN 3 - The Splitter Pack
    "3711140", // HITMAN 3 - The Banker Pack
    "3957470", // HITMAN 3 - The Bruce Lee Pack
    "4097630", // HITMAN 3 - The Eminem vs. Slim Shady Pack
    "4328240", // HITMAN 3 - Patient Zero Requiem Pack
    "4542910", // HITMAN WOA - World Champions Pack
    "4621250", // HITMAN WOA - The Wizard Pack
]

interface ModConfig {
    EnabledDLCs: string[]
    DisabledItems: string[]
    FeaturedContracts?: string[]
}

class EasyMod {
    CONFIG: ModConfig
    STEAM_NAMESPACE_DEMO = "1847520"
    CFGPATH = join(MODNAME, "config.json")
    METAPATH = join(MODNAME, "featured", "meta.json")

    constructor() {
        this.CONFIG = Object()
    }

    async Init() {
        const fs = asyncGuard.getFs()
        for (const dir of [
            MODNAME,
            join(MODNAME, "featured")
        ]) {
            if (await fs.exists(dir)) {
                continue
            }
            await fs.mkdir(dir, { recursive: true })
        }

        await this.Reload()
    }

    async Reload() {
        const fs = asyncGuard.getFs()
        if (await fs.exists(this.CFGPATH)) {
            const data = await fs.readFile(this.CFGPATH, "utf-8")
            const config = parse(data) as ModConfig
            this.CONFIG = {
                EnabledDLCs: config?.EnabledDLCs ?? [],
                DisabledItems: config?.DisabledItems ?? [],
            }
        }
    }

    async GetContracts(): Promise<MissionManifest[]> {
        const fs = asyncGuard.getFs()
        const manifests = Array<MissionManifest>()
        if (await fs.exists(this.METAPATH)) {
            const meta = parse(await fs.readFile(this.METAPATH, "utf-8"))
            for (const id of meta?.ids) {
                const ofcPath = join(MODNAME, "featured", `${id}.json`)
                if (!await fs.exists(ofcPath)) continue
                const manifest = parse(await fs.readFile(ofcPath, "utf-8"))
                if (!validateMission(manifest)) continue
                manifests.push(manifest)
            }
        }
        this.CONFIG.FeaturedContracts = manifests
            .map(elm => elm.Metadata?.Id ?? undefined)
            .filter(elm => elm ?? false);
        return manifests
    }

    get H3_EPIC_ENTITLEMENTS(): string[] {
        return [
            // H3
            "ed55aa5edc5941de92fd7f64de415793",
            ...H3_EPIC_ENTITLEMENTS
        ]
    }

    get H3_STEAM_ENTITLEMENTS(): string[] {
        let data = this.CONFIG.EnabledDLCs
        if (!data?.length) {
            data = DefaultEnabledDLCs
        }
        return data
    }

    get DISABLED_UNLOCKABLES(): string[] {
        return this.CONFIG.DisabledItems ?? []
    }

    get FEATURED_CONTRACTS(): string[] {
        return this.CONFIG.FeaturedContracts ?? []
    }
}

export const modInst = new EasyMod()
