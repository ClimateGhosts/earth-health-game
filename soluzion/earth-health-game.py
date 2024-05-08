import json
import math
import random
from copy import deepcopy
from typing import List

import jsonpickle

from soluzion import Basic_Operator

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
    ORANGE = "\033[33m"
    PURPLE = "\033[105m"
    RESET = "\033[0m"


class DisasterType(Enum):
    # Singleton Disasters
    EARTHQUAKE = "Earthquake"
    FIRE = "Fire"
    FLOOD = "Flood"
    WINDSTORM = "Windstorm"

    # Disaster Pairs
    FIRESTORM = "Firestorm (Fire + Windstorm)"
    FIREFLOOD = "Fireflood (Fire + Flood)"
    FIREQUAKE = "Firequake (Fire + Earthquake)"
    APOCALYPSE = "Apocalypse (Fire + Earthquake + Flood + Windstorm)"

    def __str__(self):
        return f"{self.color()}{self.value}{Color.RESET}"

    def __eq__(self, other):
        return self.name == other.name

    def __hash__(self):
        return hash(self.name)

    def color(self):
        if self == self.EARTHQUAKE:
            return Color.GREEN
        elif self == self.FIRE:
            return Color.RED
        elif self == self.FLOOD:
            return Color.BLUE
        elif self == self.WINDSTORM:
            return Color.YELLOW
        elif self == self.FIRESTORM:
            return Color.ORANGE
        elif self == self.FIREQUAKE:
            return Color.RED
        elif self == self.FIREFLOOD:
            return Color.BLUE
        elif self == self.APOCALYPSE:
            return Color.PURPLE
        else:
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
        if self == self.OCEAN:
            return Color.BLUE
        elif self == self.MOUNTAIN:
            return Color.CYAN
        elif self == self.PLAINS:
            return Color.YELLOW
        elif self == self.WOODS:
            return Color.GREEN
        elif self == self.MESA:
            return Color.RED
        else:
            return Color.RESET


playable_regions = list(RegionType)[1:]

# TODO data about disaster compounding, explotation potential (mesa gives more gold than plains), curves of damage and health.

# Convention: the higher the number, the worse the disaster impact.
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
    },  # TODO: change the new ones
    DisasterType.FIRESTORM: {
        RegionType.MESA: 1,
        RegionType.PLAINS: -1,
        RegionType.WOODS: -2,
        RegionType.MOUNTAIN: 2,
        RegionType.OCEAN: 0,
    },
    DisasterType.FIREQUAKE: {
        RegionType.MESA: 1,
        RegionType.PLAINS: -1,
        RegionType.WOODS: -2,
        RegionType.MOUNTAIN: 2,
        RegionType.OCEAN: 0,
    },
    DisasterType.APOCALYPSE: {
        RegionType.MESA: 1,
        RegionType.PLAINS: -1,
        RegionType.WOODS: -2,
        RegionType.MOUNTAIN: 2,
        RegionType.OCEAN: 0,
    },
    DisasterType.FIREFLOOD: {
        RegionType.MESA: 1,
        RegionType.PLAINS: -1,
        RegionType.WOODS: -2,
        RegionType.MOUNTAIN: 2,
        RegionType.OCEAN: 0,
    },
}


# TODO disaster compounding
disaster_comb_matrix: dict[DisasterType, [DisasterType]] = {
    DisasterType.APOCALYPSE: {
        DisasterType.FIRE,
        DisasterType.WINDSTORM,
        DisasterType.EARTHQUAKE,
        DisasterType.FLOOD,
    },
    DisasterType.FIRESTORM: {
        DisasterType.FIRE,
        DisasterType.WINDSTORM,
    },
    DisasterType.FIREFLOOD: {
        DisasterType.FIRE,
        DisasterType.FLOOD,
    },
    DisasterType.FIREQUAKE: {
        DisasterType.FIRE,
        DisasterType.WINDSTORM,
    },
}


@dataclass
class Devastation:
    """
    Describe which region is hit by a disaster and for how much damage.
    """

    region: str
    disaster: DisasterType
    damage: int

    def __str__(self):
        return f"{self.disaster} in {self.region} ({self.damage} damage)"

    def __eq__(self, other):
        return self.region == other.region and self.damage == other.damage and self.disaster == other.disaster

    def __hash__(self):
        return hash((self.region, self.damage, self.disaster))


"""World"""
SEED = None  # 1701
STARTING_BADNESS = 5
"""Disasters"""
MAX_DISASTERS_PER_ROUND = 5
DISASTER_CHANCE_FACTOR = (
    0.95  # Threshold for disasters to occur. lower = more disasters
)
DEFAULT_DISASTER_DAMAGE = 4
"""Regions"""
TOTAL_REGIONS = 20
MAX_REGION_HEALTH = 10
INITIAL_REGION_HEALTH = 5
"""Players"""
PLAYERS = 4
STARTING_MONEY = 100
INITIAL_REGIONS_OWNED = TOTAL_REGIONS // PLAYERS

START_OF_UNIVERSE = -1
END_OF_UNIVERSE = 5

random.seed(SEED)

region_names: list[str] = json.load(open("names.json"))


@dataclass
class RegionState:
    """
    Class within state storing the data for one region
    """

    name: str
    current_player: int
    region_type: RegionType
    health: int
    x: int
    y: int
    last_modified: int = START_OF_UNIVERSE

    def __str__(self):
        return f"{self.name} ({self.region_type}, {self.health}❤️)"

    def __eq__(self, other):
        return self.__dict__ == other.__dict__

    def __hash__(self):
        return hash((self.name, self.x, self.y))

    def rename(self, new_name):  # TODO allow vanity access
        self.name = new_name


# population: int
# temperature: float
# precipitation: float
# elevation: float
# vegetation: float
# water: float
# pollution: float
# disasters: float


class PlayerState:
    """
    Class within state storing the data for a player
    """

    def __init__(self, player_id=0):
        self.player_id = player_id
        self.money = STARTING_MONEY
        self.regions_owned = INITIAL_REGIONS_OWNED

    def __str__(self):
        return f"Player {self.player_id} with ${self.money}M and {self.regions_owned} region(s)"

    def __eq__(self, other):
        return self.__dict__ == other.__dict__


# TODO send help option


class WorldState:
    """
    Class within state storing the relative positions of regions, accessing them.
    """

    def __init__(self, region_count=TOTAL_REGIONS) -> None:
        self.regions: dict[str, RegionState] = {}
        self.map: list[str] = []
        self.region_count = region_count

        width = int(region_count**0.5)
        height = width
        # This will generate as square of a grid as possible.
        while (
            width * height < region_count
        ):  # Increase width if necessary to reach the desired area
            width += 1
            height = region_count // width  # Adjust height to maintain squareness

        # Populate the (width, height) world with regions # TODO more clever world generation, continents, perlin noise, etc
        for x in range(width):
            for y in range(height):
                region_type = random.choice(playable_regions)
                name = random.choice(region_names)
                region_names.remove(name)
                self.regions[name] = RegionState(
                    name=name,
                    current_player=-1,
                    region_type=region_type,
                    health=INITIAL_REGION_HEALTH,
                    x=x,
                    y=y,
                )
                self.map.append(name)

        self.width = width
        self.height = height

        # num_players: int

        # global_pollution: float
        # global_temperature: float
        # global_sea_level: float
        # global_health: float
        # global_disasters: float

    def __str__(self):
        result = ""
        for h in range(self.height):
            for w in range(self.width):
                region_id = self.map[h * self.width + w]
                region = self.regions[region_id]
                player_index = "p" + str(region.current_player)
                if region.current_player == -1:
                    player_index = "X"
                result += f" {region.region_type.color()}{str(region.region_type)} ({player_index}, {region.health}❤️) "  # {Color.RESET} # TODO add health
            result += "\n"

        # for region in self.regions:
        #     result += f"{region}\n"
        return result

    def reassign_governors(self, players: List[PlayerState]):
        """
        Assigns the first regions to the players.
        """
        for p in players:
            for i in range(
                    p.regions_owned
            ):  # This assumes there will always be enough regions. The last player has the "least" choice if we
                # hardcode balancing.
                # Randomly select a region from the world. If it is not ocean, assign it. Otherwise, try again.
                if not all(player.regions_owned <= 0 for player in players):
                    while True:
                        region = random.choice(list(self.regions.values()))
                        if (
                            region.current_player == -1
                            and region.region_type != RegionType.OCEAN
                            and region.health > 0
                        ):
                            region.current_player = p.player_id
                            break
                        # TODO ensure this will update by reference

    def reset_ownership(self):
        for region in self.regions.values():
            region.current_player = -1

    def get_adjacent_regions(self, region: RegionState):
        """
        Get the regions adjacent to the given region in a 9x9 grid.

        ACTUALLY. I prefer applying a mask of weights to the world, multiplied by disaster damage.
        """
        adjacent_regions = []
        for other_region in self.regions.values():
            if (
                abs(region.x - other_region.x) <= 1
                and abs(region.y - other_region.y) <= 1
                and region != other_region
            ):
                adjacent_regions.append(other_region)
        return adjacent_regions

    def apply_damage(self, devastation: Devastation):
        """
        Apply damage to a region and its neighbors.
        """
        region = devastation.region
        damage = devastation.damage
        region.health -= damage
        for neighbor in self.get_adjacent_regions(region):
            neighbor.health -= damage // 2


class State:
    """
    State for our initial game
    """

    def __init__(self):
        self.world = WorldState()
        self.stat_disasters: List[int] = (
            []
        )  # Indexed by time step, summary statistics to plot.
        self.time = 0
        self.current_player = 0
        self.global_badness = STARTING_BADNESS
        self.players = [PlayerState(player_id) for player_id in range(PLAYERS)]

        # Initialize regions, assigning them to players.
        self.world.reassign_governors(self.players)

        self.current_disasters: list[Devastation] = (
            []
        )  # Disasters to be applied per turn. Cleared at end of turn.

        self.cataclysm_history: list[list[Devastation]] = [
            []
        ]  # Stores all disasters each time step. Created to allow compounding.

        self.disaster_buffer: list[Devastation] = (
            []
        )  # Might be added to, by a Climate Ghost

        # Disasters to be processed and compounded
        self.compound_buffer: map[RegionState: list[Devastation]] = {}

        self.generate_disaster_buffer()
        self.disaster_buffer = self.generate_disaster_buffer()
        self.current_region = self.next_region()

    def serialize(self):
        return jsonpickle.encode(self, indent=2, unpicklable=False)

    def __eq__(self, other):
        return self.__dict__ == other.__dict__

    def __str__(self):
        result = "\n\n"

        result += f"The year is {2048 + self.time}, and the climate badness is {self.global_badness}.\n\n"

        result += f"World Map:\n{self.world}\n"

        for player in self.players:
            result += f"{player}\n"
            for region in self.world.regions.values():
                if region.current_player == player.player_id and region.health > 0:
                    result += f"  {region}"

            result += "\n"

        if self.time < END_OF_UNIVERSE and not all(
            p.regions_owned <= 0 for p in self.players
        ):

            result += f"\nIt is Player {self.current_player}'s turn.\n"
            player = self.players[self.current_player]

            if player.regions_owned <= 0:
                result += (
                    "You are a climate ghost! The disasters that could happen next are:"
                )
                for devastation in self.disaster_buffer:
                    result += f"\n {devastation}"
            else:
                result += (
                    f"You are deciding for {self.world.regions[self.current_region]}.\n"
                )

        return result

    def clone(self):
        return deepcopy(self)

    def is_goal(self):
        return self.time >= END_OF_UNIVERSE or all(
            player.regions_owned <= 0 for player in self.players
        )

    def next_region(self):
        current_regions = [
            region
            for region in self.world.regions.values()
            if region.last_modified < self.time
            and region.current_player == self.current_player
            and region.health > 0
        ]

        return current_regions[0].name if len(current_regions) > 0 else ""

    def goal_message(self):
        alive_players = [player for player in self.players if player.regions_owned > 0]
        # print("these are alive_players: ", alive_players)
        # print("these are all players: ", self.players)
        msg = "The Game Has Ended!\n"

        if len(alive_players) == 0:
            msg += "Everybody died :("
        else:
            msg += "The following players have survived:"
            for player in alive_players:
                msg += f"\n{player}"

        return msg

    def generate_disaster_buffer(self) -> list[Devastation]:

        current_disaster_types = [
            random.choice(list(DisasterType)) for _ in range(0, MAX_DISASTERS_PER_ROUND)
        ]

        # self.disaster_buffer.clear()

        new_disaster_buffer = []

        for disaster in current_disaster_types:
            region_id = random.choice(
                [
                    name
                    for (name, region) in self.world.regions.items()
                    if region.current_player != -1
                ]
            )
            region = self.world.regions[region_id]
            damage = (
                DEFAULT_DISASTER_DAMAGE
                + disaster_matrix[disaster][region.region_type]
                # TODO add compounding
            )

            new_disaster_buffer.append(Devastation(region_id, disaster, damage))
        return new_disaster_buffer

    def move_time_forward(self):
        """
        Primary function that processes the events of progressing time forward
        """
        self.time += 1

        self.current_disasters.clear()

        for devastation in self.disaster_buffer:
            if random.random() > math.pow(
                DISASTER_CHANCE_FACTOR, self.global_badness
            ):  # Uniform[0,1] > [0,1]^[5,inf) # Initially 0.95^5 = 0.77, 23% chance of disaster
                # at this point we've decided to cast this devastation so we perform compounding
                region = self.world.regions[devastation.region]
                print("This is a region: ", region)

                if region not in self.compound_buffer:
                    self.compound_buffer[region] = []
                self.compound_buffer[region] = []
                self.compound_buffer[region].append(devastation)

        combined = {}
        for region, disasters in self.compound_buffer.items():
            for mega_disaster, smaller_disasters in disaster_comb_matrix.items():
                if set(disasters) == smaller_disasters:
                    combined[region] = [mega_disaster]
                    break
            else:
                combined[region] = disasters

        for region, disasters in self.compound_buffer.items():
            # This is all after we've combined

            region_owner = self.players[region.current_player]

            devastation_list = []
            for disaster in disasters:
                curr_dev = Devastation(region, disaster, disaster.damage)
                devastation_list.append(curr_dev)
                self.current_disasters.append(curr_dev)

            for disaster in devastation_list:
                if region.health > 0:
                    region.health -= disaster.damage

                    if region.health <= 0:
                        # Player loses 1 region counter, and this region cannot be transitioned to.
                        if region_owner.regions_owned != 0:
                            region_owner.regions_owned -= 1
                        region.current_player = -1

        self.stat_disasters.append(len(self.current_disasters))

        self.disaster_buffer = self.generate_disaster_buffer()

        if self.time % 2 == 0:
            self.region_shuffle()

    def region_shuffle(self):
        """
        Randomly shuffle the regions owned by players to simulate the world changing.
        Uninhabitable regions (health <= 0) are not shuffled to. Oceans are not shuffled to.
        Future: have semi-random process here.
        """
        self.world.reset_ownership()
        self.world.reassign_governors(self.players)

    def transition_msg(self, s):
        """
        Transition message that happens after all players have made their decisions in a turn
        :param s: the previous state
        :return: The string to output
        """

        old_state: State = s

        msg = f"Time has progressed from {old_state.time} to {self.time}.\n"

        if len(self.current_disasters) > 0:
            msg += "\nThe following disasters have occurred:"
            for devastation in self.current_disasters:
                region = self.world.regions[devastation.region.name]
                msg += f"\n {devastation}"
                if region.health <= 0:
                    msg += f"\n{devastation.region} has been destroyed!"

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

    def is_applicable(self, state: State, role=None):
        return role is None or state.current_player == role

    def update_state(self, state: State):
        """
        Effects this operator has on the state
        :param state:
        :return:
        """
        pass

    def apply(self, old_state: State):
        """
        Real operator apply function
        :param old_state: current game state
        :return: new game state
        """
        state: State = old_state.clone()

        self.update_state(state)

        if state.current_region != "":
            state.world.regions[state.current_region].last_modified = state.time

        # Progress turns

        if state.next_region() == "":
            state.current_player += 1
            if state.current_player >= PLAYERS:
                state.move_time_forward()
                state.current_player = 0

        state.current_region = state.next_region()

        return state


class UpOperator(PlayerAction):

    MONEY_GAINED = 10  # TODO tune this (ex: less health = less money)

    def __init__(self):
        super().__init__("Exploit for wealth at the cost of health")

    def is_applicable(self, state: State, role=None):
        return (
            super().is_applicable(state, role)
            and state.players[state.current_player].regions_owned > 0
        )

    def update_state(self, state: State):
        region = state.world.regions[state.current_region]

        region.health -= 1
        # TODO may need a death handler here - DONE
        if region.health <= 0:
            region_owner = state.players[region.current_player]
            if region_owner.regions_owned != 0:
                region_owner.regions_owned -= 1

        state.global_badness += 1
        state.players[state.current_player].money += self.MONEY_GAINED


class DownOperator(PlayerAction):

    MONEY_REQUIRED = 20  # TODO tune this to depend on health

    def __init__(self):
        super().__init__("Heal and don't steal")

    def is_applicable(self, state: State, role=None):
        return (
            super().is_applicable(state, role)
            and state.players[state.current_player].regions_owned > 0
            and state.players[state.current_player].money >= self.MONEY_REQUIRED
        )

    def update_state(self, state: State):
        region = state.world.regions[state.current_region]
        region.health = min(region.health + 1, MAX_REGION_HEALTH)
        player = state.players[region.current_player]
        player.money -= self.MONEY_REQUIRED


class NoneOperator(PlayerAction):
    def __init__(self):
        super().__init__("Take no action for your faction")

    def update_state(self, state: State):
        pass
        # region = state.world.regions[state.current_region]
        # player = state.players[region.current_player]


class SendForeignAidOperator(PlayerAction):

    MONEY_REQUIRED = 30  # Fixing the world is expensive, especially far away.

    def __init__(self):
        super().__init__("Send Foreign Aid")

    def is_applicable(self, state: State, role=None):
        return (
            super().is_applicable(state, role)
            and state.players[state.current_player].regions_owned > 0
            and state.players[state.current_player].money >= self.MONEY_REQUIRED
        )

    def update_state(self, state: State):
        region = state.world.regions[state.current_region]
        player = state.players[region.current_player]
        for region in state.world.regions.values():
            if region.current_player != state.current_player:
                region.health = min(region.health + 1, MAX_REGION_HEALTH)
                # player = state.players[region.current_player]
        player.money -= self.MONEY_REQUIRED


class ClimateGhostOperator(PlayerAction):
    def __init__(self):
        super().__init__("Reshuffle the upcoming kerfuffle")

    def is_applicable(self, state: State, role=None):
        return (
            super().is_applicable(state, role)
            and state.players[state.current_player].regions_owned <= 0
        )

    def update_state(self, state: State):
        state.disaster_buffer = state.generate_disaster_buffer()

        # TODO this should be a transition, but could overlap with turn end

        print("The new disaster list is:")
        for devestation in state.disaster_buffer:
            print(f" {devestation}")


OPERATORS = [
    UpOperator(),
    DownOperator(),
    NoneOperator(),
    SendForeignAidOperator(),
    ClimateGhostOperator(),
]

# endregion OPERATORS


# region TRANSITIONS

TRANSITIONS = [
    (lambda s1, s2, op: s1.time != s2.time, lambda s1, s2, op: s2.transition_msg(s1))
]

# endregion TRANSITIONS

# region ROLES

ROLES = [{"name": f"Player {i + 1}", "min": 1, "max": 1} for i in range(PLAYERS)]

# endregion
