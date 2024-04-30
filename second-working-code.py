import math
import random
from copy import deepcopy
from soluzion import Basic_Operator, Basic_State

# region METADATA
SOLUZION_VERSION = "4.0"
PROBLEM_NAME = "Earth Health"
PROBLEM_VERSION = "1.0"
PROBLEM_AUTHORS = ["Alicia Stepin", "Andrey Risukhin", "James Gale", "Maxim Kuznetsov"]
PROBLEM_CREATION_DATE = "23-APRIL-2024"

# The following field is mainly for the human solver, via either the Text_SOLUZION_Client.
# or the SVG graphics client.
PROBLEM_DESC = """
    Climate change disasters are not independent, but are cumulative and compounding. 
    They lead to changing migration and settlement patterns for animals, people, 
    and therefore educators, charities, and organizations. 
    """

# endregion METADATA

# region COMMON_CODE

from dataclasses import dataclass
from enum import Enum


class Color:
    """
    Console text color codes
    """

    RED = "\033[91m"
    GREEN = "\033[92m"
    YELLOW = "\033[93m"
    BLUE = "\033[94m"
    MAGENTA = "\033[95m"
    CYAN = "\033[96m"
    WHITE = "\033[97m"
    RESET = "\033[0m"


class DisasterType(Enum):
    EARTHQUAKE = "Earthquake"
    FIRE = "Fire"
    FLOOD = "Flood"
    WINDSTORM = "Windstorm"

    def __str__(self):
        return f"{self.color()}{self.value}{Color.RESET}"

    def color(self):
        match self:
            case self.EARTHQUAKE:
                return Color.GREEN
            case self.FIRE:
                return Color.RED
            case self.FLOOD:
                return Color.BLUE
            case self.WINDSTORM:
                return Color.YELLOW
            case _:
                return Color.RESET


class RegionType(Enum):
    OCEAN = "Ocean"
    MOUNTAIN = "Mountain"
    PLAINS = "Plains"
    WOODS = "Woods"
    MESA = "Mesa"

    def __str__(self):
        return f"{self.color()}{self.value}{Color.RESET}"

    def color(self):
        match self:
            case self.OCEAN:
                return Color.BLUE
            case self.MOUNTAIN:
                return Color.CYAN
            case self.PLAINS:
                return Color.YELLOW
            case self.WOODS:
                return Color.GREEN
            case self.MESA:
                return Color.RED
            case _:
                return Color.RESET


playable_regions = list(RegionType)[1:]

disaster_matrix: dict[DisasterType, dict[RegionType, int]] = {
    DisasterType.EARTHQUAKE: {
        RegionType.MESA: 2,
        RegionType.PLAINS: -2,
        RegionType.WOODS: -1,
        RegionType.MOUNTAIN: 1,
        RegionType.OCEAN: 0,
    },
    DisasterType.FIRE: {
        RegionType.MESA: -2,
        RegionType.PLAINS: 1,
        RegionType.WOODS: 2,
        RegionType.MOUNTAIN: -1,
        RegionType.OCEAN: 0,
    },
    DisasterType.FLOOD: {
        RegionType.MESA: -1,
        RegionType.PLAINS: 2,
        RegionType.WOODS: 1,
        RegionType.MOUNTAIN: -2,
        RegionType.OCEAN: 0,
    },
    DisasterType.WINDSTORM: {
        RegionType.MESA: 1,
        RegionType.PLAINS: -1,
        RegionType.WOODS: -2,
        RegionType.MOUNTAIN: 2,
        RegionType.OCEAN: 0,
    },
}


@dataclass
class Region:
    """
    Region of the Earth
    """

    x: int
    y: int  # Coordinates in the gridmap
    biome: RegionType
    health: int
    player: int


# name: str
# population: int
# temperature: float
# precipitation: float
# elevation: float
# vegetation: float
# water: float
# pollution: float
# health: float
# disasters: float


@dataclass
class World:
    # 2d array of regions
    regions: list[list[Region]]
    num_players: int

    # global_pollution: float
    # global_temperature: float
    # global_sea_level: float
    # global_health: float
    # global_disasters: float


MAX_REGION_HEALTH = 10
INITIAL_REGION_HEALTH = 5
STARTING_MONEY = 100
STARTING_BADNESS = 5
PLAYERS = 4
SEED = None  # 1701
MAX_DISASTERS_PER_ROUND = 5
DISASTER_CHANCE_FACTOR = 0.95  # lower = more disasters
DEFAULT_DISASTER_DAMAGE = 4

random.seed(SEED)


class RegionState:
    """
    Class within state storing the data for one region
    """

    def __init__(self, name: str, current_player: int, region_type: RegionType):
        self.name = name
        self.current_player = current_player
        self.health = INITIAL_REGION_HEALTH
        self.region_type = region_type

    def __str__(self):
        return f"Region {self.name} ({self.region_type}) with {self.health} health"

    def __eq__(self, other):
        return self.__dict__ == other.__dict__


class PlayerState:
    """
    Class within state storing the data for a player
    """

    def __init__(self, player_id=0):
        self.player_id = player_id
        self.money = STARTING_MONEY

    def __str__(self):
        return f"Player {self.player_id} with {self.money} money"

    def __eq__(self, other):
        return self.__dict__ == other.__dict__


class State:
    """
    State for our initial game
    """

    def __init__(self):
        self.time = 0
        self.current_player = 0
        self.global_badness = STARTING_BADNESS
        self.players = [PlayerState(player_id) for player_id in range(PLAYERS)]
        self.regions = {
            "Jamestown": RegionState("Jamestown", 0, random.choice(playable_regions)),
            "Alicialand": RegionState("Alicialand", 1, random.choice(playable_regions)),
            "Maxopolis": RegionState("Maxopolis", 2, random.choice(playable_regions)),
            "Andreyville": RegionState(
                "Andreyville", 3, random.choice(playable_regions)
            ),
        }
        self.current_disasters: list[tuple[DisasterType, str, int]] = []

    def __eq__(self, other):
        return self.__dict__ == other.__dict__

    def __str__(self):
        result = "\n"

        for player in self.players:
            result += f"{player}\n"
            for region in self.regions.values():
                if region.current_player == player.player_id:
                    result += f"  {region}\n"

            result += "\n"

        result += f"The time is {self.time} and the climate badness is {self.global_badness}\n"
        result += f"It is Player {self.current_player}'s turn\n"

        return result

    def clone(self):
        return deepcopy(self)

    def is_goal(self):
        return False

    def goal_message(self):
        return "TODO goal message"

    def move_time_forward(self):
        """
        Primary function that processes the events of progressing time forward
        """
        self.time += 1

        current_disaster_types = []

        for i in range(0, MAX_DISASTERS_PER_ROUND):
            if random.random() > math.pow(DISASTER_CHANCE_FACTOR, self.global_badness):
                disaster = random.choice(list(DisasterType))
                current_disaster_types.append(disaster)

        self.current_disasters.clear()
        for disaster in current_disaster_types:
            region_id = random.choice(list(self.regions.keys()))
            region = self.regions[region_id]
            damage = (
                DEFAULT_DISASTER_DAMAGE + disaster_matrix[disaster][region.region_type]
            )

            region.health -= damage

            if region.health <= 0:
                # TODO eliminate a region
                pass

            self.current_disasters.append((disaster, region_id, damage))

    def transition_msg(self, s):
        """
        Transition message that happens after all players have made their decisions in a turn
        :param s: the previous state
        :return: The string to output
        """

        old_state: State = s

        msg = f"Time has progressed from {old_state.time} to {self.time}.\n"

        if len(self.current_disasters) > 0:
            for disaster_tuple in self.current_disasters:
                disaster_type = disaster_tuple[0]
                region = disaster_tuple[1]
                damage = disaster_tuple[2]

                msg += f"\nA {disaster_type} hit {region} for {damage} damage."

        else:
            msg += "\nNo disasters occurred."

        return msg


# endregion COMMON_CODE

# region OPERATORS


class PlayerAction(Basic_Operator):
    """
    Base operator for a particular action that a player can take on their turn
    """

    def __init__(self, name):
        super().__init__(name)

    def is_applicable(self, state: State):
        return True

    def update_state(self, state: State):
        """
        Effects this operator has on the state
        :param state:
        :return:
        """
        pass

    def apply(self, state: State):
        """
        Real operator apply function
        :param state: current game state
        :return: new game state
        """
        new_state: State = state.clone()

        self.update_state(new_state)

        # Progress turns

        new_state.current_player += 1
        if new_state.current_player >= PLAYERS:
            new_state.move_time_forward()
            new_state.current_player = 0

        return new_state


class UpOperator(PlayerAction):
    def __init__(self):
        super().__init__("Be selfish")

    def update_state(self, state: State):
        state.global_badness += 1

        state.players[state.current_player].money += 10


class DownOperator(PlayerAction):
    def __init__(self):
        super().__init__("Be not selfish")

    def update_state(self, state: State):
        for region in state.regions.values():
            if region.current_player == state.current_player:
                region.health = min(region.health + 1, MAX_REGION_HEALTH)


class NoneOperator(PlayerAction):
    def __init__(self):
        super().__init__("Do nothing")

    def update_state(self, state: State):
        pass


OPERATORS = [UpOperator(), DownOperator(), NoneOperator()]

# endregion OPERATORS


# region TRANSITIONS

TRANSITIONS = [
    (lambda s1, s2, op: s1.time != s2.time, lambda s1, s2, op: s2.transition_msg(s1))
]

# endregion TRANSITIONS
