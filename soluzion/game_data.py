from typing import Optional, Any, List, Dict, TypeVar, Type, cast, Callable


T = TypeVar("T")


def from_int(x: Any) -> int:
    assert isinstance(x, int) and not isinstance(x, bool)
    return x


def from_none(x: Any) -> Any:
    assert x is None
    return x


def from_union(fs, x):
    for f in fs:
        try:
            return f(x)
        except:
            pass
    assert False


def from_str(x: Any) -> str:
    assert isinstance(x, str)
    return x


def from_bool(x: Any) -> bool:
    assert isinstance(x, bool)
    return x


def to_class(c: Type[T], x: Any) -> dict:
    assert isinstance(x, c)
    return cast(Any, x).to_dict()


def from_list(f: Callable[[Any], T], x: Any) -> List[T]:
    assert isinstance(x, list)
    return [f(y) for y in x]


def from_dict(f: Callable[[Any], T], x: Any) -> Dict[str, T]:
    assert isinstance(x, dict)
    return { k: f(v) for (k, v) in x.items() }


class DisasterMatrix:
    earthquake: Optional[int]
    fire: Optional[int]
    flood: Optional[int]
    windstorm: Optional[int]

    def __init__(self, earthquake: Optional[int], fire: Optional[int], flood: Optional[int], windstorm: Optional[int]) -> None:
        self.earthquake = earthquake
        self.fire = fire
        self.flood = flood
        self.windstorm = windstorm

    @staticmethod
    def from_dict(obj: Any) -> 'DisasterMatrix':
        assert isinstance(obj, dict)
        earthquake = from_union([from_int, from_none], obj.get("Earthquake"))
        fire = from_union([from_int, from_none], obj.get("Fire"))
        flood = from_union([from_int, from_none], obj.get("Flood"))
        windstorm = from_union([from_int, from_none], obj.get("Windstorm"))
        return DisasterMatrix(earthquake, fire, flood, windstorm)

    def to_dict(self) -> dict:
        result: dict = {}
        if self.earthquake is not None:
            result["Earthquake"] = from_union([from_int, from_none], self.earthquake)
        if self.fire is not None:
            result["Fire"] = from_union([from_int, from_none], self.fire)
        if self.flood is not None:
            result["Flood"] = from_union([from_int, from_none], self.flood)
        if self.windstorm is not None:
            result["Windstorm"] = from_union([from_int, from_none], self.windstorm)
        return result


class Biome:
    name: str
    color: str
    playable: bool
    emoji: str
    disaster_matrix: DisasterMatrix

    def __init__(self, name: str, color: str, playable: bool, emoji: str, disaster_matrix: DisasterMatrix) -> None:
        self.name = name
        self.color = color
        self.playable = playable
        self.emoji = emoji
        self.disaster_matrix = disaster_matrix

    @staticmethod
    def from_dict(obj: Any) -> 'Biome':
        assert isinstance(obj, dict)
        name = from_str(obj.get("name"))
        color = from_str(obj.get("color"))
        playable = from_bool(obj.get("playable"))
        emoji = from_str(obj.get("emoji"))
        disaster_matrix = DisasterMatrix.from_dict(obj.get("disaster_matrix"))
        return Biome(name, color, playable, emoji, disaster_matrix)

    def to_dict(self) -> dict:
        result: dict = {}
        result["name"] = from_str(self.name)
        result["color"] = from_str(self.color)
        result["playable"] = from_bool(self.playable)
        result["emoji"] = from_str(self.emoji)
        result["disaster_matrix"] = to_class(DisasterMatrix, self.disaster_matrix)
        return result


class Disaster:
    name: str
    color: str
    damage: int
    emoji: str
    disaster_matrix: DisasterMatrix

    def __init__(self, name: str, color: str, damage: int, emoji: str, disaster_matrix: DisasterMatrix) -> None:
        self.name = name
        self.color = color
        self.damage = damage
        self.emoji = emoji
        self.disaster_matrix = disaster_matrix

    @staticmethod
    def from_dict(obj: Any) -> 'Disaster':
        assert isinstance(obj, dict)
        name = from_str(obj.get("name"))
        color = from_str(obj.get("color"))
        damage = from_int(obj.get("damage"))
        emoji = from_str(obj.get("emoji"))
        disaster_matrix = DisasterMatrix.from_dict(obj.get("disaster_matrix"))
        return Disaster(name, color, damage, emoji, disaster_matrix)

    def to_dict(self) -> dict:
        result: dict = {}
        result["name"] = from_str(self.name)
        result["color"] = from_str(self.color)
        result["damage"] = from_int(self.damage)
        result["emoji"] = from_str(self.emoji)
        result["disaster_matrix"] = to_class(DisasterMatrix, self.disaster_matrix)
        return result


class GameData:
    biomes: List[Biome]
    disasters: List[Disaster]
    player_colors: List[str]
    adjacency: Dict[str, List[int]]
    names: List[str]

    def __init__(self, biomes: List[Biome], disasters: List[Disaster], player_colors: List[str], adjacency: Dict[str, List[int]], names: List[str]) -> None:
        self.biomes = biomes
        self.disasters = disasters
        self.player_colors = player_colors
        self.adjacency = adjacency
        self.names = names

    @staticmethod
    def from_dict(obj: Any) -> 'GameData':
        assert isinstance(obj, dict)
        biomes = from_list(Biome.from_dict, obj.get("biomes"))
        disasters = from_list(Disaster.from_dict, obj.get("disasters"))
        player_colors = from_list(from_str, obj.get("player_colors"))
        adjacency = from_dict(lambda x: from_list(from_int, x), obj.get("adjacency"))
        names = from_list(from_str, obj.get("names"))
        return GameData(biomes, disasters, player_colors, adjacency, names)

    def to_dict(self) -> dict:
        result: dict = {}
        result["biomes"] = from_list(lambda x: to_class(Biome, x), self.biomes)
        result["disasters"] = from_list(lambda x: to_class(Disaster, x), self.disasters)
        result["player_colors"] = from_list(from_str, self.player_colors)
        result["adjacency"] = from_dict(lambda x: from_list(from_int, x), self.adjacency)
        result["names"] = from_list(from_str, self.names)
        return result


def game_data_from_dict(s: Any) -> GameData:
    return GameData.from_dict(s)


def game_data_to_dict(x: GameData) -> Any:
    return to_class(GameData, x)
