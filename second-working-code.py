import math
from copy import deepcopy

from soluzion import Basic_Operator, Basic_State

# <METADATA>
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

# </METADATA>

# <COMMON_CODE>

from dataclasses import dataclass
from enum import Enum


class DisasterType(Enum):
    pass


class RegionType(Enum):
    OCEAN = 0
    MOUNTAIN = 1
    PLAINS = 2
    WOODS = 3
    MESA = 4


# TODO data about interaction of disaster and region


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


MAX_REGION_HEALTH = 5
INITIAL_REGION_HEALTH = 3
STARTING_MONEY = 100

PLAYERS = 4


class RegionState:
    """
    Class within state storing the data for one region
    """

    def __init__(self, name: str, current_player: int):
        self.name = name
        self.current_player = current_player
        self.health = INITIAL_REGION_HEALTH

    def __str__(self):
        return f"Region {self.name} with {self.health} health"

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
        self.global_badness = 0
        self.players = [PlayerState(player_id) for player_id in range(PLAYERS)]
        self.regions = {
            "Jamestown": RegionState("Jamestown", 0),
            "Alicialand": RegionState("Alicialand", 1),
            "Maxopolis": RegionState("Maxopolis", 2),
            "Andreyville": RegionState("Andreyville", 3),
        }

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


class PlayerAction(Basic_Operator):
    """
    Base operator for a particular action that a player can take on their turn
    """

    def __init__(self, name):
        super().__init__(name)

    def is_applicable(self, state: State):
        return True

    def update_state(self, state: State):
        pass

    def apply(self, state: State):
        new_state: State = state.clone()

        self.update_state(new_state)

        # Progress turns

        new_state.current_player += 1
        if new_state.current_player >= PLAYERS:
            new_state.time += 1
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


# </COMMON_CODE>

# <OPERATORS>
OPERATORS = [UpOperator(), DownOperator(), NoneOperator()]

# </OPERATORS>
