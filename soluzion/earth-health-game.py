from __future__ import annotations

import json
import math
import random
from copy import deepcopy
from typing import List, Optional

import jsonpickle

from game_data import GameData
from soluzion import Basic_Operator

# region METADATA
SOLUZION_VERSION = "4.0"
PROBLEM_NAME = "Earth Health"
PROBLEM_VERSION = "0.5.1"  # TODO Keep updating this value to make the server deployment always use the latest version
PROBLEM_AUTHORS = ["Alicia Stepin", "Andrey Risukhin", "James Gale", "Maxim Kuznetsov"]
PROBLEM_CREATION_DATE = "23-APRIL-2024"
PROBLEM_DESC = """
    Climate change disasters are not independent, but are cumulative and compounding. 
    They lead to changing migration and settlement patterns for animals, people, 
    and therefore educators, charities, and organizations. 
    """
# endregion METADATA


from dataclasses import dataclass

game_data = GameData.from_dict(json.load(open("../shared/gamedata.json")))
"""Imported static game data from the shared json file"""

biomes = dict((biome.name, biome) for biome in game_data.biomes)
playable_biomes = [biome.name for biome in game_data.biomes if biome.playable]
disasters = dict((disaster.name, disaster) for disaster in game_data.disasters)
disaster_combos = dict((combo.name, combo) for combo in game_data.disaster_combos)

# World
SEED = None  # 1701
STARTING_BADNESS = 5

# Disasters
MAX_DISASTERS_PER_ROUND = 5
DISASTER_CHANCE_FACTOR = (
    0.95  # Threshold for disasters to occur. lower = more disasters
)
DEFAULT_DISASTER_DAMAGE = 4

# Regions
TOTAL_REGIONS = 20
MAX_REGION_HEALTH = 10
INITIAL_REGION_HEALTH = 5

# Players
MAX_PLAYERS = 5
STARTING_MONEY = 100

START_OF_UNIVERSE = -1
END_OF_UNIVERSE = 5

random.seed(SEED)

# region COMMON_CODE


class GameOptions:
    Players = "players"
    GameLength = "Game Length"
    RegionShuffling = "Region Shuffling"


@dataclass
class Devastation:
    """
    Describe which region is hit by a disaster and for how much damage.
    """

    region_id: int
    region: str
    disaster: str
    current_owner: int
    damage: Optional[int] = None
    adjacent_damage: Optional[dict[int, int]] = None

    def __str__(self):
        return f"{disasters[self.disaster].emoji}{self.disaster} in {self.region} ({self.damage} damage)"

    def __eq__(self, other):
        return self.__dict__ == other.__dict__

    def __hash__(self):
        return hash((self.region, self.damage, self.disaster))


@dataclass
class RegionState:
    """
    Class within state storing the data for one region
    """

    id: int
    name: str
    current_player: int
    biome: str
    health: int
    devastation_history: dict[int, list[Devastation]]

    def __str__(self):
        return f"{self.name} ({self.biome}, {self.health}❤️)"

    def __eq__(self, other):
        return self.__dict__ == other.__dict__

    def __hash__(self):
        return hash(self.name)


@dataclass
class PlayerState:
    """
    Class within state storing the data for a player
    """

    player_id: int
    regions_owned: int
    current_actions: dict[int, int]
    money: int = STARTING_MONEY

    def __str__(self):
        return f"Player {self.player_id} with ${self.money}M and {self.regions_owned} region(s)"

    def __eq__(self, other):
        return self.__dict__ == other.__dict__


class WorldState:
    """
    Class within state storing the relative positions of regions, accessing them.
    """

    def __init__(self, region_count=TOTAL_REGIONS) -> None:
        self.regions: list[RegionState] = []
        self.region_count = region_count

        names = game_data.names.copy()

        for i in range(region_count):
            region_type = random.choice(playable_biomes)
            name = random.choice(names)
            names.remove(name)
            self.regions.append(
                RegionState(
                    id=i,
                    name=name,
                    current_player=-1,
                    biome=region_type,
                    health=INITIAL_REGION_HEALTH,
                    devastation_history={},
                )
            )

    def __str__(self):
        ret_str = ""
        for region in self.regions:
            ret_str += region.__str__() + "\n"
        return ret_str

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
                        region = random.choice(list(self.regions))
                        if (
                            region.current_player == -1
                            and biomes[region.biome].playable
                            and region.health > 0
                        ):
                            region.current_player = p.player_id
                            break

    def reset_ownership(self):
        for region in self.regions:
            region.current_player = -1

    def get_adjacent_regions(self, region: RegionState):
        """
        Get the regions from the adjacency data
        """

        return [self.regions[r] for r in game_data.adjacency[str(region.id)]]


class State:
    """
    State for our initial game
    """

    def __init__(self, args: dict[str, any] = None):
        args = args or {}
        self.player_count = int(args.get(GameOptions.Players, MAX_PLAYERS))
        self.region_shuffling = bool(args.get(GameOptions.RegionShuffling, False))
        self.final_turn = int(args.get(GameOptions.GameLength, END_OF_UNIVERSE))
        self.aoe_disasters = False

        self.world = WorldState()
        self.stat_disasters: List[int] = []
        """Indexed by time step, summary statistics to plot."""
        self.time = 0
        self.current_player = 0
        self.global_badness = STARTING_BADNESS
        self.players = [
            PlayerState(player_id, TOTAL_REGIONS // self.player_count, {})
            for player_id in range(self.player_count)
        ]

        # Initialize regions, assigning them to players.
        self.world.reassign_governors(self.players)

        self.devastations: list[Devastation] = []
        """Disasters that have been applied within the past turn"""

        self.disaster_buffer: list[Devastation] = self.generate_disaster_buffer()
        """Disasters that may happen in the next round"""

    def serialize(self):
        return jsonpickle.encode(self, indent=2, unpicklable=False)

    def __eq__(self, other):
        return self.__dict__ == other.__dict__

    def __str__(self):
        result = "\n\n"

        result += f"The year is {2050 + self.time * 10}, and the climate badness is {self.global_badness}.\n\n"

        # result += f"World Map:\n{self.world}\n"

        for player in self.players:
            result += f"{player}\n"
            for region in self.world.regions:
                if region.current_player == player.player_id and region.health > 0:
                    result += f"  {region}"

            result += "\n"

        if self.time < self.final_turn and not all(
            p.regions_owned <= 0 for p in self.players
        ):

            result += f"\nIt is Player {self.current_player}'s turn.\n"
            player = self.players[self.current_player]

            if player.regions_owned <= 0:
                result += (
                    "You are a climate ghost! The disasters that could happen next are:"
                )
                for d in self.disaster_buffer:
                    result += f"\n {d}"
            else:
                result += "You are deciding for:"
                for r in self.world.regions:
                    if (
                        r.current_player == self.current_player
                        and r.id not in player.current_actions
                    ):
                        result += f"\n[{r.id}] {r}"

        return result

    def clone(self):
        return deepcopy(self)

    def is_goal(self):
        return self.time >= self.final_turn or all(
            player.regions_owned <= 0 for player in self.players
        )

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
            random.choice(list(disasters.keys()))
            for _ in range(0, MAX_DISASTERS_PER_ROUND)
        ]

        new_disaster_buffer = []

        for disaster in current_disaster_types:
            region_id = random.choice(
                [
                    region.id
                    for region in self.world.regions
                    if (region.current_player != -1) and (region.health > 0)
                ]
            )
            region = self.world.regions[region_id]
            new_disaster_buffer.append(
                Devastation(region_id, region.name, disaster, region.current_player)
            )

        return new_disaster_buffer

    def apply_devastation(self, devastation: Devastation):
        region = self.world.regions[devastation.region_id]
        biome = biomes[region.biome]
        disaster = disasters[devastation.disaster]

        devastation.damage = disaster.damage

        # Biome vulnerability / resistance
        devastation.damage += getattr(
            biome.disaster_matrix, devastation.disaster.lower(), 0
        )

        # Past disasters affecting vulnerability / resistance
        for time, devastations in region.devastation_history.items():
            for d in devastations:
                devastation.damage += getattr(
                    disasters[d.disaster].disaster_matrix, d.disaster.lower(), 0
                )

        # Apply main damage
        self.apply_damage(region, devastation.damage)

        if self.aoe_disasters:  # Apply adjacent damage
            for neighbor in self.world.get_adjacent_regions(region):
                adjacent_damage = devastation.damage // 2
                self.apply_damage(neighbor, adjacent_damage)
                devastation.adjacent_damage[neighbor.id] = adjacent_damage

    def apply_damage(self, region: RegionState, damage: int):
        region.health -= damage

        if region.health <= 0:
            region.health = 0
            if region.current_player != -1:
                player = self.players[region.current_player]
                if player.regions_owned > 0:
                    player.regions_owned -= 1
                region.current_player = -1

    def move_time_forward(self):
        """
        Primary function that processes the events of progressing time forward
        """
        self.time += 1

        for player in self.players:
            if player.money < 10:
                player.money = 0
            else:
                player.money -= 10

        self.devastations.clear()

        # Choose and apply current devastations
        for devastation in self.disaster_buffer:
            if random.random() > math.pow(
                DISASTER_CHANCE_FACTOR, self.global_badness
            ):  # Uniform[0,1] > [0,1]^[5,inf) # Initially 0.95^5 = 0.77, 23% chance of disaster
                self.devastations.append(devastation)

                self.apply_devastation(devastation)

        # Save devastations history
        for devastation in self.devastations:
            region = self.world.regions[devastation.region_id]
            if self.time not in region.devastation_history:
                region.devastation_history[self.time] = []
            region.devastation_history[self.time].append(devastation)

        self.stat_disasters.append(len(self.devastations))

        self.disaster_buffer = self.generate_disaster_buffer()

        if self.region_shuffling:
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

        msg = f"Time has progressed from {old_state.time * 10 + 2050} to {self.time * 10 + 2050}.\n"

        if len(self.devastations) > 0:
            msg += "\nThe following disasters have occurred:"
            for d in self.devastations:
                r = self.world.regions[d.region_id]
                msg += f"\n {d}"
                if r.health <= 0:
                    msg += f"\n{d.region} has been destroyed!"

        else:
            msg += "\nNo disasters occurred."

        return msg


# endregion COMMON_CODE

# region OPERATORS


class PlayerAction(Basic_Operator):
    """
    Base operator for a particular action that a player can take on their turn
    """

    def __init__(self, name, params=None):
        super().__init__(name, transf=self.transf, params=params or [])

    def is_applicable(self, state: State, role=None):
        return role is None or state.current_player == role

    def update_state(self, state: State, args: dict[str, any] = None):
        """
        Effects this operator has on the state
        :param state:
        :param args:
        :return:
        """
        pass

    def transf(self, old_state: State, params: Optional[list[any]] = None):
        """
        Real operator apply function
        :param params:
        :param old_state: current game state
        :return: new game state
        """
        state: State = old_state.clone()

        args = {}
        if params:
            for i, param in enumerate(self.params):
                args[param["name"]] = params[i]

        self.update_state(state, args)

        return state


class RegionAction(PlayerAction):
    """
    Operator for an action the performs effects on a specific region
    """

    op_no: int
    """Corresponds to the index this will be put in the OPERATORS array"""

    net_money: int

    def __init__(self, name):
        super().__init__(
            name,
            params=[{"name": "Region", "type": "int", "min": 0, "max": TOTAL_REGIONS}],
        )

    def is_applicable(self, state: State, role=None):
        return (
            super().is_applicable(state, role)
            and state.players[state.current_player].regions_owned > 0
            and state.players[state.current_player].money >= -self.net_money
        )

    def get_name(self, state: State):
        return self.name + (
            f" ({'+' if self.net_money > 0 else ''}{self.net_money}M$)"
            if self.net_money != 0
            else ""
        )

    def update_state(self, state: State, args: dict[str, any] = None):
        region = state.world.regions[args["Region"]]
        self.update_region(state, region)
        state.players[state.current_player].money += self.net_money
        player = state.players[state.current_player]
        player.current_actions[region.id] = self.op_no

    def update_region(self, state: State, region: RegionState):
        pass


class ExploitOperator(RegionAction):
    op_no = 0
    net_money = +10

    def __init__(self):
        super().__init__("Exploit for wealth at the cost of health (-1❤️)")

    def update_region(self, state: State, region: RegionState):
        state.apply_damage(region, 1)
        state.global_badness += 1


class HealOperator(RegionAction):
    op_no = 1
    net_money = -20

    def __init__(self):
        super().__init__("Heal and don't steal (+1❤️)")

    def update_region(self, state: State, region: RegionState):
        region.health = min(region.health + 1, MAX_REGION_HEALTH)


class SendForeignAidOperator(RegionAction):
    op_no = 2

    net_money = -30  # Fixing the world is expensive, especially far away.

    def __init__(self):
        super().__init__("Send Foreign Aid (+1❤️)")

    def update_region(self, state: State, region: RegionState):
        if region.health > 0:
            region.health = min(region.health + 1, MAX_REGION_HEALTH)
        pass


class ClimateGhostOperator(PlayerAction):
    op_no = 3

    def __init__(self):
        super().__init__("Reshuffle the upcoming kerfuffle")

    def is_applicable(self, state: State, role=None):
        return (
            super().is_applicable(state, role)
            and state.players[state.current_player].regions_owned <= 0
        )

    def update_state(self, state: State, args: Optional[dict[str, any]] = None):
        state.disaster_buffer = state.generate_disaster_buffer()

        # TODO this should be a transition, but could overlap with turn end

        print("The new disaster list is:")
        for devastation in state.disaster_buffer:
            print(f" {devastation}")


class EndTurnOperator(PlayerAction):
    op_no = 4

    def __init__(self):
        super().__init__("End Turn")

    def update_state(self, state: State, args: Optional[dict[str, any]] = None):
        player = state.players[state.current_player]
        player.current_actions.clear()
        state.current_player += 1
        if state.current_player >= state.player_count:
            state.move_time_forward()
            state.current_player = 0


class RenameRegionOperator(PlayerAction):
    op_no = 5

    def __init__(self):
        super().__init__(
            "Rename Region",
            params=[
                {"name": "Region", "type": "int", "min": 0, "max": TOTAL_REGIONS},
                {"name": "Name", "type": "str"},
            ],
        )

    def is_applicable(self, state: State, role=None):
        return (
            super().is_applicable(state, role)
            and state.players[state.current_player].regions_owned > 0
        )

    def update_state(self, state: State, args: dict[str, any] = None):
        region = state.world.regions[args["Region"]]
        region.name = args["Name"]


OPERATORS = [
    ExploitOperator(),
    HealOperator(),
    SendForeignAidOperator(),
    ClimateGhostOperator(),
    EndTurnOperator(),
    RenameRegionOperator(),
]

# endregion OPERATORS


# region TRANSITIONS

TRANSITIONS = [
    (lambda s1, s2, op: s1.time != s2.time, lambda s1, s2, op: s2.transition_msg(s1)),
]

# endregion TRANSITIONS

# region ROLES

ROLES = [
    {
        "name": f"Player {i} [{game_data.player_colors[i].title()}]",
        "min": 1 if i <= 1 else 0,
        "max": 1,
    }
    for i in range(MAX_PLAYERS)
]


# noinspection PyPep8Naming
def VALIDATE_ROLES(roles: list[set[int]]):
    player_roles = [role for role_list in roles for role in role_list]

    if TOTAL_REGIONS // len(player_roles) != TOTAL_REGIONS / len(player_roles):
        return f"Having {len(player_roles)} players is not currently supported."

    for role_id in range(max(player_roles)):
        if role_id not in player_roles:
            return f"Can't have a {ROLES[max(player_roles)]['name']} without a {ROLES[role_id]['name']}."

    return None


# endregion

# region OPTIONS

OPTIONS = [
    {
        "name": GameOptions.Players,
        "type": "int",
        "default": MAX_PLAYERS,
        "min": 2,
        "max": MAX_PLAYERS,
    },
    {
        "name": GameOptions.RegionShuffling,
        "type": "bool",
        "default": False,
        "description": "(whether or not to periodically shuffle the regions)",
    },
    {
        "name": GameOptions.GameLength,
        "type": "int",
        "default": END_OF_UNIVERSE,
        "min": 3,
        "max": 20,
        "description": "(how many turns before the game ends)",
    },
]

# endregion

if __name__ == "__main__":
    """Generates an example version of the state to a json file that can be used for type checking"""

    with open("../shared/state.json", "w") as outfile:
        state = State()

        state.disaster_buffer = [
            Devastation(0, "", disaster.name, 0) for disaster in game_data.disasters
        ]
        state.devastations = state.disaster_buffer

        for region in state.world.regions:
            for i, devastation in enumerate(state.disaster_buffer):
                region.devastation_history[i] = [devastation]

        outfile.write(state.serialize())
