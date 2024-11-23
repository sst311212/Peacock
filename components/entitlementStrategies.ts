/*
 *     The Peacock Project - a HITMAN server replacement.
 *     Copyright (C) 2021-2024 The Peacock Project Team
 *
 *     This program is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU Affero General Public License as published by
 *     the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU Affero General Public License for more details.
 *
 *     You should have received a copy of the GNU Affero General Public License
 *     along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { AxiosError, AxiosResponse } from "axios"
import { log, LogLevel } from "./loggingInterop"
import { userAuths } from "./officialServerAuth"
import {
    EPIC_NAMESPACE_2021,
    SCPC_ENTITLEMENTS,
    getEpicEntitlements,
    H2_STEAM_ENTITLEMENTS,
    STEAM_NAMESPACE_2016,
    STEAM_NAMESPACE_2021,
    H3_EPIC_ENTITLEMENTS,
} from "./platformEntitlements"
import { GameVersion } from "./types/types"
import { getRemoteService } from "./utils"

/**
 * The base class for an entitlement strategy.
 *
 * @internal
 */
abstract class EntitlementStrategy {
    abstract get(
        accessToken: string,
        userId: string,
    ): string[] | Promise<string[]>
}

/**
 * Provider for HITMAN 3 on Epic Games Store.
 *
 * @internal
 */
export class EpicH3Strategy extends EntitlementStrategy {
    override get() {
        return H3_EPIC_ENTITLEMENTS
    }
}

/**
 * Provider for any game using the official servers.
 *
 * @internal
 */
export class IOIStrategy extends EntitlementStrategy {
    override get() {
        return [
            STEAM_NAMESPACE_2021,
            "1829580",
            "1829581",
            "1829582",
            "1829583",
            "1829584",
            "1829585",
            "1829586",
            "1829587",
            "1829590",
            "1829591",
            "1829592",
            "1829593",
            "1829594",
            "1829595",
            "1829596",
            "1829600",
            "1829601",
            "1829602",
            "1829603",
            "1829604",
            "1829605",
            "1843460",
            "2184790",
            "2184791",
            "2475260",
            "2828470",
            "2973650",
            "3110360",
            "3254350",
        ]
    }
}

/**
 * Provider for HITMAN 2016 on Epic Games.
 *
 * @internal
 */
export class EpicH1Strategy extends EntitlementStrategy {
    override get() {
        return [
            "0a73eaedcac84bd28b567dbec764c5cb", // Hitman 1 standard edition
            "81aecb49a60b47478e61e1cbd68d63c5", // Hitman 1 GOTY upgrade
        ]
    }
}

/**
 * Provider for HITMAN: Sniper Challenge (Hawk) on Steam.
 *
 * @internal
 */
export class SteamScpcStrategy extends EntitlementStrategy {
    override get() {
        return SCPC_ENTITLEMENTS
    }
}

/**
 * Provider for HITMAN 2016 on Steam.
 *
 * @internal
 */
export class SteamH1Strategy extends EntitlementStrategy {
    override get() {
        return [
            STEAM_NAMESPACE_2016,
            "439870",
            "439890",
            "440930",
            "440940",
            "440960",
            "440961",
            "440962",
            "505180",
            "588780",
        ]
    }
}

/**
 * Provider for HITMAN 2 on Steam.
 *
 * @internal
 */
export class SteamH2Strategy extends EntitlementStrategy {
    override get() {
        return H2_STEAM_ENTITLEMENTS
    }
}
