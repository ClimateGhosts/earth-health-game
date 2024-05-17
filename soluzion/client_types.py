from enum import Enum
from typing import Optional, Any, TypeVar, Type, cast


T = TypeVar("T")
EnumT = TypeVar("EnumT", bound=Enum)


def from_none(x: Any) -> Any:
    assert x is None
    return x


def from_float(x: Any) -> float:
    assert isinstance(x, (float, int)) and not isinstance(x, bool)
    return float(x)


def from_union(fs, x):
    for f in fs:
        try:
            return f(x)
        except:
            pass
    assert False


def from_bool(x: Any) -> bool:
    assert isinstance(x, bool)
    return x


def to_float(x: Any) -> float:
    assert isinstance(x, (int, float))
    return x


def to_enum(c: Type[EnumT], x: Any) -> EnumT:
    assert isinstance(x, c)
    return x.value


def to_class(c: Type[T], x: Any) -> dict:
    assert isinstance(x, c)
    return cast(Any, x).to_dict()


class RegionType(Enum):
    MESA = "Mesa"
    MOUNTAIN = "Mountain"
    OCEAN = "Ocean"
    PLAINS = "Plains"
    WOODS = "Woods"


class DisasterType(Enum):
    EARTHQUAKE = "Earthquake"
    FIRE = "Fire"
    FLOOD = "Flood"
    WINDSTORM = "Windstorm"


class GameOptions:
    players: Optional[float]
    region_shuffling: Optional[bool]

    def __init__(self, players: Optional[float], region_shuffling: Optional[bool]) -> None:
        self.players = players
        self.region_shuffling = region_shuffling

    @staticmethod
    def from_dict(obj: Any) -> 'GameOptions':
        assert isinstance(obj, dict)
        players = from_union([from_none, from_float], obj.get("players"))
        region_shuffling = from_union([from_none, from_bool], obj.get("region_shuffling"))
        return GameOptions(players, region_shuffling)

    def to_dict(self) -> dict:
        result: dict = {}
        result["players"] = from_union([from_none, to_float], self.players)
        result["region_shuffling"] = from_union([from_none, from_bool], self.region_shuffling)
        return result


def region_type_from_dict(s: Any) -> RegionType:
    return RegionType(s)


def region_type_to_dict(x: RegionType) -> Any:
    return to_enum(RegionType, x)


def disaster_type_from_dict(s: Any) -> DisasterType:
    return DisasterType(s)


def disaster_type_to_dict(x: DisasterType) -> Any:
    return to_enum(DisasterType, x)


def game_options_from_dict(s: Any) -> GameOptions:
    return GameOptions.from_dict(s)


def game_options_to_dict(x: GameOptions) -> Any:
    return to_class(GameOptions, x)


def operators_from_dict(s: Any) -> float:
    return from_float(s)


def operators_to_dict(x: float) -> Any:
    return to_float(x)
