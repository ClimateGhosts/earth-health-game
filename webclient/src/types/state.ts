// To parse this data:
//
//   import { Convert, State } from "./file";
//
//   const state = Convert.toState(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface State {
    player_count:     number;
    region_shuffling: boolean;
    final_turn:       number;
    aoe_disasters:    boolean;
    world:            World;
    stat_disasters:   any[];
    time:             number;
    current_player:   number;
    global_badness:   number;
    players:          Player[];
    devastations:     Devastation[];
    disaster_buffer:  Devastation[];
}

export interface Devastation {
    region_id:       number;
    region:          string;
    disaster:        Disaster;
    current_owner:   number;
    damage:          null;
    adjacent_damage: null;
}

export enum Disaster {
    Earthquake = "Earthquake",
    Fire = "Fire",
    Flood = "Flood",
    Windstorm = "Windstorm",
}

export interface Player {
    player_id:       number;
    regions_owned:   number;
    current_actions: CurrentActions;
    money:           number;
}

export interface CurrentActions {
}

export interface World {
    regions:      Region[];
    region_count: number;
}

export interface Region {
    id:                  number;
    name:                string;
    current_player:      number;
    biome:               Biome;
    health:              number;
    devastation_history: { [key: string]: Devastation[] };
}

export enum Biome {
    Mesa = "Mesa",
    Mountain = "Mountain",
    Plains = "Plains",
    Woods = "Woods",
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
    public static toState(json: string): State {
        return cast(JSON.parse(json), r("State"));
    }

    public static stateToJson(value: State): string {
        return JSON.stringify(uncast(value, r("State")), null, 2);
    }
}

function invalidValue(typ: any, val: any, key: any, parent: any = ''): never {
    const prettyTyp = prettyTypeName(typ);
    const parentText = parent ? ` on ${parent}` : '';
    const keyText = key ? ` for key "${key}"` : '';
    throw Error(`Invalid value${keyText}${parentText}. Expected ${prettyTyp} but got ${JSON.stringify(val)}`);
}

function prettyTypeName(typ: any): string {
    if (Array.isArray(typ)) {
        if (typ.length === 2 && typ[0] === undefined) {
            return `an optional ${prettyTypeName(typ[1])}`;
        } else {
            return `one of [${typ.map(a => { return prettyTypeName(a); }).join(", ")}]`;
        }
    } else if (typeof typ === "object" && typ.literal !== undefined) {
        return typ.literal;
    } else {
        return typeof typ;
    }
}

function jsonToJSProps(typ: any): any {
    if (typ.jsonToJS === undefined) {
        const map: any = {};
        typ.props.forEach((p: any) => map[p.json] = { key: p.js, typ: p.typ });
        typ.jsonToJS = map;
    }
    return typ.jsonToJS;
}

function jsToJSONProps(typ: any): any {
    if (typ.jsToJSON === undefined) {
        const map: any = {};
        typ.props.forEach((p: any) => map[p.js] = { key: p.json, typ: p.typ });
        typ.jsToJSON = map;
    }
    return typ.jsToJSON;
}

function transform(val: any, typ: any, getProps: any, key: any = '', parent: any = ''): any {
    function transformPrimitive(typ: string, val: any): any {
        if (typeof typ === typeof val) return val;
        return invalidValue(typ, val, key, parent);
    }

    function transformUnion(typs: any[], val: any): any {
        // val must validate against one typ in typs
        const l = typs.length;
        for (let i = 0; i < l; i++) {
            const typ = typs[i];
            try {
                return transform(val, typ, getProps);
            } catch (_) {}
        }
        return invalidValue(typs, val, key, parent);
    }

    function transformEnum(cases: string[], val: any): any {
        if (cases.indexOf(val) !== -1) return val;
        return invalidValue(cases.map(a => { return l(a); }), val, key, parent);
    }

    function transformArray(typ: any, val: any): any {
        // val must be an array with no invalid elements
        if (!Array.isArray(val)) return invalidValue(l("array"), val, key, parent);
        return val.map(el => transform(el, typ, getProps));
    }

    function transformDate(val: any): any {
        if (val === null) {
            return null;
        }
        const d = new Date(val);
        if (isNaN(d.valueOf())) {
            return invalidValue(l("Date"), val, key, parent);
        }
        return d;
    }

    function transformObject(props: { [k: string]: any }, additional: any, val: any): any {
        if (val === null || typeof val !== "object" || Array.isArray(val)) {
            return invalidValue(l(ref || "object"), val, key, parent);
        }
        const result: any = {};
        Object.getOwnPropertyNames(props).forEach(key => {
            const prop = props[key];
            const v = Object.prototype.hasOwnProperty.call(val, key) ? val[key] : undefined;
            result[prop.key] = transform(v, prop.typ, getProps, key, ref);
        });
        Object.getOwnPropertyNames(val).forEach(key => {
            if (!Object.prototype.hasOwnProperty.call(props, key)) {
                result[key] = transform(val[key], additional, getProps, key, ref);
            }
        });
        return result;
    }

    if (typ === "any") return val;
    if (typ === null) {
        if (val === null) return val;
        return invalidValue(typ, val, key, parent);
    }
    if (typ === false) return invalidValue(typ, val, key, parent);
    let ref: any = undefined;
    while (typeof typ === "object" && typ.ref !== undefined) {
        ref = typ.ref;
        typ = typeMap[typ.ref];
    }
    if (Array.isArray(typ)) return transformEnum(typ, val);
    if (typeof typ === "object") {
        return typ.hasOwnProperty("unionMembers") ? transformUnion(typ.unionMembers, val)
            : typ.hasOwnProperty("arrayItems")    ? transformArray(typ.arrayItems, val)
            : typ.hasOwnProperty("props")         ? transformObject(getProps(typ), typ.additional, val)
            : invalidValue(typ, val, key, parent);
    }
    // Numbers can be parsed by Date but shouldn't be.
    if (typ === Date && typeof val !== "number") return transformDate(val);
    return transformPrimitive(typ, val);
}

function cast<T>(val: any, typ: any): T {
    return transform(val, typ, jsonToJSProps);
}

function uncast<T>(val: T, typ: any): any {
    return transform(val, typ, jsToJSONProps);
}

function l(typ: any) {
    return { literal: typ };
}

function a(typ: any) {
    return { arrayItems: typ };
}

function u(...typs: any[]) {
    return { unionMembers: typs };
}

function o(props: any[], additional: any) {
    return { props, additional };
}

function m(additional: any) {
    return { props: [], additional };
}

function r(name: string) {
    return { ref: name };
}

const typeMap: any = {
    "State": o([
        { json: "player_count", js: "player_count", typ: 0 },
        { json: "region_shuffling", js: "region_shuffling", typ: true },
        { json: "final_turn", js: "final_turn", typ: 0 },
        { json: "aoe_disasters", js: "aoe_disasters", typ: true },
        { json: "world", js: "world", typ: r("World") },
        { json: "stat_disasters", js: "stat_disasters", typ: a("any") },
        { json: "time", js: "time", typ: 0 },
        { json: "current_player", js: "current_player", typ: 0 },
        { json: "global_badness", js: "global_badness", typ: 0 },
        { json: "players", js: "players", typ: a(r("Player")) },
        { json: "devastations", js: "devastations", typ: a(r("Devastation")) },
        { json: "disaster_buffer", js: "disaster_buffer", typ: a(r("Devastation")) },
    ], false),
    "Devastation": o([
        { json: "region_id", js: "region_id", typ: 0 },
        { json: "region", js: "region", typ: "" },
        { json: "disaster", js: "disaster", typ: r("Disaster") },
        { json: "current_owner", js: "current_owner", typ: 0 },
        { json: "damage", js: "damage", typ: null },
        { json: "adjacent_damage", js: "adjacent_damage", typ: null },
    ], false),
    "Player": o([
        { json: "player_id", js: "player_id", typ: 0 },
        { json: "regions_owned", js: "regions_owned", typ: 0 },
        { json: "current_actions", js: "current_actions", typ: r("CurrentActions") },
        { json: "money", js: "money", typ: 0 },
    ], false),
    "CurrentActions": o([
    ], false),
    "World": o([
        { json: "regions", js: "regions", typ: a(r("Region")) },
        { json: "region_count", js: "region_count", typ: 0 },
    ], false),
    "Region": o([
        { json: "id", js: "id", typ: 0 },
        { json: "name", js: "name", typ: "" },
        { json: "current_player", js: "current_player", typ: 0 },
        { json: "biome", js: "biome", typ: r("Biome") },
        { json: "health", js: "health", typ: 0 },
        { json: "devastation_history", js: "devastation_history", typ: m(a(r("Devastation"))) },
    ], false),
    "Disaster": [
        "Earthquake",
        "Fire",
        "Flood",
        "Windstorm",
    ],
    "Biome": [
        "Mesa",
        "Mountain",
        "Plains",
        "Woods",
    ],
};
