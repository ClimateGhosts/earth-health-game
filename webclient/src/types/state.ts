// To parse this data:
//
//   import { Convert, State } from "./file";
//
//   const state = Convert.toState(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface State {
    options:           Options;
    world:             World;
    stat_disasters:    any[];
    time:              number;
    current_player:    number;
    global_badness:    number;
    player_count:      number;
    players:           Player[];
    current_disasters: any[];
    cataclysm_history: Array<any[]>;
    disaster_buffer:   DisasterBuffer[];
    compound_buffer:   CompoundBuffer;
}

export interface CompoundBuffer {
}

export interface DisasterBuffer {
    region_id: number;
    region:    string;
    disaster:  Disaster;
    damage:    number;
}

export interface Disaster {
    _value_:      string;
    _name_:       string;
    __objclass__: Objclass;
    _sort_order_: number;
}

export interface Objclass {
    "py/type": PyType;
}

export enum PyType {
    MainDisasterType = "__main__.DisasterType",
    MainRegionType = "__main__.RegionType",
}

export interface Options {
    players: number;
}

export interface Player {
    player_id:       number;
    money:           number;
    regions_owned:   number;
    current_actions: CompoundBuffer;
}

export interface World {
    regions:      Region[];
    region_count: number;
}

export interface Region {
    id:             number;
    name:           string;
    current_player: number;
    region_type:    Disaster;
    health:         number;
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
        { json: "options", js: "options", typ: r("Options") },
        { json: "world", js: "world", typ: r("World") },
        { json: "stat_disasters", js: "stat_disasters", typ: a("any") },
        { json: "time", js: "time", typ: 0 },
        { json: "current_player", js: "current_player", typ: 0 },
        { json: "global_badness", js: "global_badness", typ: 0 },
        { json: "player_count", js: "player_count", typ: 0 },
        { json: "players", js: "players", typ: a(r("Player")) },
        { json: "current_disasters", js: "current_disasters", typ: a("any") },
        { json: "cataclysm_history", js: "cataclysm_history", typ: a(a("any")) },
        { json: "disaster_buffer", js: "disaster_buffer", typ: a(r("DisasterBuffer")) },
        { json: "compound_buffer", js: "compound_buffer", typ: r("CompoundBuffer") },
    ], false),
    "CompoundBuffer": o([
    ], false),
    "DisasterBuffer": o([
        { json: "region_id", js: "region_id", typ: 0 },
        { json: "region", js: "region", typ: "" },
        { json: "disaster", js: "disaster", typ: r("Disaster") },
        { json: "damage", js: "damage", typ: 0 },
    ], false),
    "Disaster": o([
        { json: "_value_", js: "_value_", typ: "" },
        { json: "_name_", js: "_name_", typ: "" },
        { json: "__objclass__", js: "__objclass__", typ: r("Objclass") },
        { json: "_sort_order_", js: "_sort_order_", typ: 0 },
    ], false),
    "Objclass": o([
        { json: "py/type", js: "py/type", typ: r("PyType") },
    ], false),
    "Options": o([
        { json: "players", js: "players", typ: 0 },
    ], false),
    "Player": o([
        { json: "player_id", js: "player_id", typ: 0 },
        { json: "money", js: "money", typ: 0 },
        { json: "regions_owned", js: "regions_owned", typ: 0 },
        { json: "current_actions", js: "current_actions", typ: r("CompoundBuffer") },
    ], false),
    "World": o([
        { json: "regions", js: "regions", typ: a(r("Region")) },
        { json: "region_count", js: "region_count", typ: 0 },
    ], false),
    "Region": o([
        { json: "id", js: "id", typ: 0 },
        { json: "name", js: "name", typ: "" },
        { json: "current_player", js: "current_player", typ: 0 },
        { json: "region_type", js: "region_type", typ: r("Disaster") },
        { json: "health", js: "health", typ: 0 },
    ], false),
    "PyType": [
        "__main__.DisasterType",
        "__main__.RegionType",
    ],
};