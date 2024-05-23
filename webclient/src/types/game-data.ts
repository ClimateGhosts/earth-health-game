// To parse this data:
//
//   import { Convert, GameData } from "./file";
//
//   const gameData = Convert.toGameData(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface GameData {
    biomes:          Biome[];
    disasters:       Disaster[];
    disaster_combos: DisasterCombo[];
    player_colors:   string[];
    adjacency:       { [key: string]: number[] };
    names:           string[];
}

export interface Biome {
    name:            string;
    color:           string;
    playable:        boolean;
    emoji:           string;
    disaster_matrix: DisasterMatrix;
}

export interface DisasterMatrix {
    Earthquake?: number;
    Fire?:       number;
    Flood?:      number;
    Windstorm?:  number;
}

export interface DisasterCombo {
    name:      string;
    disasters: string[];
    effect:    number;
}

export interface Disaster {
    name:            string;
    color:           string;
    damage:          number;
    emoji:           string;
    disaster_matrix: DisasterMatrix;
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
    public static toGameData(json: string): GameData {
        return cast(JSON.parse(json), r("GameData"));
    }

    public static gameDataToJson(value: GameData): string {
        return JSON.stringify(uncast(value, r("GameData")), null, 2);
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
    "GameData": o([
        { json: "biomes", js: "biomes", typ: a(r("Biome")) },
        { json: "disasters", js: "disasters", typ: a(r("Disaster")) },
        { json: "disaster_combos", js: "disaster_combos", typ: a(r("DisasterCombo")) },
        { json: "player_colors", js: "player_colors", typ: a("") },
        { json: "adjacency", js: "adjacency", typ: m(a(0)) },
        { json: "names", js: "names", typ: a("") },
    ], false),
    "Biome": o([
        { json: "name", js: "name", typ: "" },
        { json: "color", js: "color", typ: "" },
        { json: "playable", js: "playable", typ: true },
        { json: "emoji", js: "emoji", typ: "" },
        { json: "disaster_matrix", js: "disaster_matrix", typ: r("DisasterMatrix") },
    ], false),
    "DisasterMatrix": o([
        { json: "Earthquake", js: "Earthquake", typ: u(undefined, 0) },
        { json: "Fire", js: "Fire", typ: u(undefined, 0) },
        { json: "Flood", js: "Flood", typ: u(undefined, 0) },
        { json: "Windstorm", js: "Windstorm", typ: u(undefined, 0) },
    ], false),
    "DisasterCombo": o([
        { json: "name", js: "name", typ: "" },
        { json: "disasters", js: "disasters", typ: a("") },
        { json: "effect", js: "effect", typ: 0 },
    ], false),
    "Disaster": o([
        { json: "name", js: "name", typ: "" },
        { json: "color", js: "color", typ: "" },
        { json: "damage", js: "damage", typ: 0 },
        { json: "emoji", js: "emoji", typ: "" },
        { json: "disaster_matrix", js: "disaster_matrix", typ: r("DisasterMatrix") },
    ], false),
};
