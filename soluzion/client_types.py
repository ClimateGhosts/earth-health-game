from enum import Enum
from typing import Any, TypeVar, Type, cast


T = TypeVar("T")
EnumT = TypeVar("EnumT", bound=Enum)


def from_float(x: Any) -> float:
    assert isinstance(x, (float, int)) and not isinstance(x, bool)
    return float(x)


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
    players: float

    def __init__(self, players: float) -> None:
        self.players = players

    @staticmethod
    def from_dict(obj: Any) -> 'GameOptions':
        assert isinstance(obj, dict)
        players = from_float(obj.get("players"))
        return GameOptions(players)

    def to_dict(self) -> dict:
        result: dict = {}
        result["players"] = to_float(self.players)
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
